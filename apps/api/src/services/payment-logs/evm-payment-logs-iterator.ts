
import { EvmBlockchainMeta, Token } from 'rango-sdk-basic'
import { Address, hexToString, parseAbiItem } from 'viem'

import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'
import { EvmEvent, EvmPayment, EvmPaymentDirection, EvmPaymentEvent, EvmWithdrawBatchEvent, EvmWithdrawEvent } from '@repo/evm/dist/src/interfaces/evm-event'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'

import { logger } from '../../utils/logger'
import { AbiEvent } from 'abitype'
import { PaymentLogsIterator } from './payment-logs-iterator'
import { tokenAmountToUsd } from '../../utils/utils'
import { AccountService } from '../account-service'
import { MetaService } from '../meta-service'
import { TokenByTimestamp } from '../../interfaces/token'
import { SettingsService } from '../settings-service'

export class EvmPaymentLogsIterator implements PaymentLogsIterator {
  private fromBlock: bigint = BigInt(0)
  private paymentEvent: AbiEvent = parseAbiItem('event PayFrom(uint256 dt, address from, address indexed to, address token, uint256 amount, bytes paymentId)')
  private withdrawEvent: AbiEvent = parseAbiItem('event WithdrawTo(uint256 dt, address from, address to, address token, uint256 amount)')
  private withdrawBatchEvent: AbiEvent = parseAbiItem('event WithdrawToBatch(uint256 dt, address from, address[] accounts, address[] tokens, uint256[] amounts)')

  public constructor(
    private blockchain: EvmBlockchainMeta,
    private janeDoeAddress: Address,
    private wrappedNativeAddress: Address,
    private accountService: AccountService,
    private evmService: EvmService,
    private metaService: MetaService,
    private settingsService: SettingsService,
  ) { }

  public lastProcessed(): string {
    return this.fromBlock.toString()
  }

  public skip(lastProcessed: string): void {
    this.fromBlock = BigInt(lastProcessed)
  }

  public async nextBatch(): Promise<PaymentLog[]> {
    logger.debug('EvmPaymentLogsIteratorService: start to process next batch')

    const config = await this.settingsService.loadBlockchainEvmClientConfigSettings(this.blockchain.chainId)

    logger.debug('EvmPaymentLogsIteratorService: start to get block number')
    const toBlock = await this.evmService.blockNumber(config, this.blockchain.chainId)
    logger.debug(`EvmPaymentLogsIteratorService: block number ${toBlock.toString()}`)

    if (this.fromBlock > toBlock) {
      logger.debug(`EvmPaymentLogsIteratorService: no new block found for ${this.blockchain.name}`)
      return []
    }

    logger.debug(`EvmPaymentLogsIteratorService: start to get payment events from ${this.fromBlock} to ${toBlock} for blockchain ${this.blockchain.name} and janedoe address ${this.janeDoeAddress}`)
    const paymentEvents: EvmEvent<EvmPaymentEvent>[] = await this.evmService.events(config, this.blockchain.chainId, this.fromBlock, toBlock, this.janeDoeAddress, this.paymentEvent)
    logger.debug(`EvmPaymentLogsIteratorService: found ${paymentEvents.length} payment events`)

    logger.debug(`EvmPaymentLogsIteratorService: start to get withdraw events from ${this.fromBlock} to ${toBlock} for blockchain ${this.blockchain.name} and janedoe address ${this.janeDoeAddress}`)
    const withdrawEvents: EvmEvent<EvmWithdrawEvent>[] = await this.evmService.events(config, this.blockchain.chainId, this.fromBlock, toBlock, this.janeDoeAddress, this.withdrawEvent)
    logger.debug(`EvmPaymentLogsIteratorService: found ${withdrawEvents.length} withdraw events`)

    logger.debug(`EvmPaymentLogsIteratorService: start to get withdraw batch events from ${this.fromBlock} to ${toBlock} for blockchain ${this.blockchain.name} and janedoe address ${this.janeDoeAddress}`)
    const withdrawBatchEvents: EvmEvent<EvmWithdrawBatchEvent>[] = await this.evmService.events(config, this.blockchain.chainId, this.fromBlock, toBlock, this.janeDoeAddress, this.withdrawBatchEvent)
    logger.debug(`EvmPaymentLogsIteratorService: found ${withdrawBatchEvents.length} withdraw batch events`)

    const events: EvmPayment[] = [
      ...paymentEvents.map(event => ({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        dt: event.data.dt,
        from: event.data.from,
        to: event.data.to,
        token: event.data.token,
        amount: event.data.amount,
        paymentId: hexToString(event.data.paymentId),
        direction: 'incoming' as EvmPaymentDirection
      })),
      ...withdrawEvents.map(event => ({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        dt: event.data.dt,
        from: event.data.from,
        to: event.data.to,
        token: event.data.token,
        amount: event.data.amount,
        paymentId: `${this.blockchain.name.toLocaleLowerCase()}_${event.transactionHash}_0`,
        direction: 'outgoing' as EvmPaymentDirection
      })),
      ...withdrawBatchEvents.flatMap(event =>
        event.data.tokens.map((token, index) => ({
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          dt: event.data.dt,
          from: event.data.from,
          to: event.data.accounts[index],
          token: token,
          amount: event.data.amounts[index],
          paymentId: `${this.blockchain.name.toLocaleLowerCase()}_${event.transactionHash}_${index}`,
          direction: 'outgoing' as EvmPaymentDirection
        }))
      )
    ]

    this.fromBlock = toBlock + BigInt(1)
    if (events.length === 0) {
      return []
    }

    const tokensByTimestamp: TokenByTimestamp[] = events.map(
      event => ({
        blockchain: this.blockchain.name,
        address: event.token.toLocaleLowerCase() === this.wrappedNativeAddress.toLocaleLowerCase() ? null : event.token,
        timestamp: Number(event.dt.toString())
      })
    )

    logger.debug('EvmPaymentLogsIteratorService: start to get tokens by timestamps')
    logger.debug(tokensByTimestamp)
    const tokensAtTxTime = await this.metaService.loadTokens(tokensByTimestamp)
    logger.debug('EvmPaymentLogsIteratorService: end to get tokens by timestamps')
    logger.debug(tokensAtTxTime)

    logger.debug('EvmPaymentLogsIteratorService: start to transform events to payment logs')
    const paymentLogs = await Promise.all(events.map((event, i) => this.processEvent(event, tokensAtTxTime[i])))
    const filteredPaymentLogs = paymentLogs.filter(log => !!log) as PaymentLog[]
    logger.debug(`EvmPaymentLogsIteratorService: ${filteredPaymentLogs.length} payment logs created`)
    logger.debug(filteredPaymentLogs)

    return filteredPaymentLogs
  }

  private async processEvent(payment: EvmPayment, token: Token | undefined): Promise<PaymentLog | undefined> {
    logger.debug('EvmPaymentLogsIteratorService: start to process evm payment')
    logger.debug(payment)

    const accountProfile = payment.direction === 'outgoing'
      ? await this.accountService.loadAccountProfileByAddress(payment.from)
      : await this.accountService.loadAccountProfileByAddress(payment.to)
    if (!accountProfile) {
      logger.debug(`EvmPaymentLogsIteratorService: account profile for ${payment.to} not found`)
      return undefined
    }

    let paymentId: string
    if (payment.direction === 'outgoing') {
      paymentId = payment.paymentId
    } else {
      const protocolPaymentId = payment.paymentId
      if (protocolPaymentId.length < ACCOUNT_ID_LENGTH + 1) {
        logger.debug(`EvmPaymentLogsIteratorService: skip to process event since protocol payment id ${protocolPaymentId} is less than ${ACCOUNT_ID_LENGTH}`)
        return undefined
      }

      paymentId = protocolPaymentId.substring(ACCOUNT_ID_LENGTH)
    }

    const timestamp = Number(payment.dt.toString())
    const address = payment.token.toLocaleLowerCase() === this.wrappedNativeAddress.toLocaleLowerCase() ? null : payment.token
    const amount = payment.amount.toString()
    const amountUsd = token ? tokenAmountToUsd(amount, token.usdPrice, token.decimals) : undefined

    const paymentLog: PaymentLog = {
      accountId: accountProfile.id,
      paymentId: paymentId,

      blockchain: this.blockchain.name,
      tokenAddress: address,
      tokenSymbol: token?.symbol ?? null,
      tokenDecimals: token?.decimals ?? null,
      tokenUsdPrice: token?.usdPrice ?? null,

      from: payment.from,
      to: payment.to,
      direction: payment.direction,
      amount: amount,
      amountUsd: amountUsd ?? null,

      block: payment.blockNumber.toString(),
      timestamp: timestamp,
      transaction: payment.transactionHash,
      index: 0
    }

    logger.debug('EvmPaymentLogsIteratorService: payment log')
    logger.debug(paymentLog)

    return paymentLog
  }
}
