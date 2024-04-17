
import { EvmBlockchainMeta, Token } from 'rango-sdk-basic'
import { Address, hexToString, parseAbiItem } from 'viem'

import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'
import { EvmEvent, EvmPaymentEvent } from '@repo/evm/dist/src/interfaces/evm-event'
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

    logger.debug(`EvmPaymentLogsIteratorService: start to get events from ${this.fromBlock} to ${toBlock} for blockchain ${this.blockchain.name} and janedoe address ${this.janeDoeAddress}`)
    const events: EvmEvent<EvmPaymentEvent>[] = await this.evmService.events(config, this.blockchain.chainId, this.fromBlock, toBlock, this.janeDoeAddress, this.paymentEvent)
    logger.debug(`EvmPaymentLogsIteratorService: found ${events.length} events`)

    this.fromBlock = toBlock + BigInt(1)

    const tokensByTimestamp: TokenByTimestamp[] = events.map(
      event => ({
        blockchain: this.blockchain.name,
        address: event.data.token.toLocaleLowerCase() === this.wrappedNativeAddress.toLocaleLowerCase() ? null : event.data.token,
        timestamp: Number(event.data.dt.toString())
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

  private async processEvent(event: EvmEvent<EvmPaymentEvent>, token: Token | undefined): Promise<PaymentLog | undefined> {
    logger.debug('EvmPaymentLogsIteratorService: start to process evm event')
    logger.debug(event)

    const accountProfile = await this.accountService.loadAccountProfileByAddress(event.data.to)
    if (!accountProfile) {
      logger.debug(`EvmPaymentLogsIteratorService: account profile for ${event.data.to} not found`)
      return undefined
    }

    const protocolPaymentId = hexToString(event.data.paymentId)
    if (protocolPaymentId.length < ACCOUNT_ID_LENGTH + 1) {
      logger.debug(`EvmPaymentLogsIteratorService: skip to process event since protocol payment id ${protocolPaymentId} is less than ${ACCOUNT_ID_LENGTH}`)
      return undefined
    }

    const timestamp = Number(event.data.dt.toString())
    const address = event.data.token.toLocaleLowerCase() === this.wrappedNativeAddress.toLocaleLowerCase() ? null : event.data.token
    const amount = event.data.amount.toString()
    const amountUsd = token ? tokenAmountToUsd(amount, token.usdPrice, token.decimals) : undefined
    const paymentId = protocolPaymentId.substring(ACCOUNT_ID_LENGTH)

    const paymentLog: PaymentLog = {
      accountId: accountProfile.id,
      paymentId: paymentId,

      blockchain: this.blockchain.name,
      tokenAddress: address,
      tokenSymbol: token?.symbol ?? null,
      tokenDecimals: token?.decimals ?? null,
      tokenUsdPrice: token?.usdPrice ?? null,

      from: event.data.from,
      to: event.data.to,
      amount: amount,
      amountUsd: amountUsd ?? null,

      block: event.blockNumber.toString(),
      timestamp: timestamp,
      transaction: event.transactionHash,
      index: event.logIndex,
    }

    logger.debug('EvmPaymentLogsIteratorService: payment log')
    logger.debug(paymentLog)

    return paymentLog
  }
}
