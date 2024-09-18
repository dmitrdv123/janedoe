
import { BlockchainMeta } from 'rango-sdk-basic'

import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'

import { BLOCKCHAIN_BTC, BLOCKCHAIN_BTC_NATIVE_TOKEN_DECIMALS } from '../../constants'
import { PaymentLogsIterator } from './payment-logs-iterator'
import { logger } from '../../utils/logger'
import { parseToBigNumber, tokenAmountToUsd } from '../../utils/utils'
import { MetaService } from '../meta-service'

export class BitcoinPaymentLogsIterator implements PaymentLogsIterator {
  private fromHeight: number = 0

  public constructor(
    private blockchain: BlockchainMeta,
    private bitcoinBlockService: BitcoinBlockService,
    private metaService: MetaService
  ) {
  }

  public lastProcessed(): string {
    return this.fromHeight.toString()
  }

  public skip(lastProcessed: string): void {
    this.fromHeight = parseInt(lastProcessed)
  }

  public async nextBatch(): Promise<PaymentLog[]> {
    logger.debug('BitcoinPaymentLogsIterator: start to process next batch')

    const toHeight = await this.bitcoinBlockService.getLatestProcessedBlockHeight()
    if (toHeight === undefined) {
      logger.debug('BitcoinPaymentLogsIterator: skip batch since last processed block not found')
      return []
    }

    if (this.fromHeight > toHeight) {
      logger.debug(`BitcoinPaymentLogsIterator: skip batch since from block height ${this.fromHeight} is more than to block height ${toHeight}`)
      return []
    }

    logger.debug(`BitcoinPaymentLogsIterator: start to list transactions from block height ${this.fromHeight} to block height ${toHeight}`)
    const transactionOutputs = await this.bitcoinBlockService.listBlockTransactionOutputs(this.fromHeight, toHeight)
    logger.debug(`BitcoinPaymentLogsIterator: found ${transactionOutputs.length} transactions`)

    this.fromHeight = toHeight + 1
    if (transactionOutputs.length === 0) {
      return []
    }

    const tokensByTimestamp = transactionOutputs.map(tx => ({
      timestamp: tx.data.time,
      blockchain: this.blockchain.name,
      address: null
    }))
    const tokensAtTxTime = await this.metaService.loadTokens(tokensByTimestamp)

    const paymentLogs = transactionOutputs
      .map((tx, i) => {
        const tokenAtTxTime = tokensAtTxTime[i]
        const amount = parseToBigNumber(tx.data.amount, BLOCKCHAIN_BTC_NATIVE_TOKEN_DECIMALS).toString()
        const amountUsd = tokenAtTxTime ? tokenAmountToUsd(amount, tokenAtTxTime.usdPrice, tokenAtTxTime.decimals) : undefined

        const paymentLog: PaymentLog = {
          accountId: tx.label?.substring(0, ACCOUNT_ID_LENGTH) ?? '',
          paymentId: tx.label?.substring(ACCOUNT_ID_LENGTH) ?? '',

          blockchain: this.blockchain.name,
          tokenAddress: null,
          tokenSymbol: BLOCKCHAIN_BTC.toLocaleUpperCase(),
          tokenDecimals: BLOCKCHAIN_BTC_NATIVE_TOKEN_DECIMALS,
          tokenUsdPrice: tokenAtTxTime?.usdPrice ?? null,

          from: null,
          to: tx.data.address,
          amount: amount,
          amountUsd: amountUsd ?? null,

          block: tx.data.blockhash,
          timestamp: tx.data.time,
          transaction: tx.data.txid,
          index: tx.data.vout,
        }

        return paymentLog
      })

    logger.debug(`BitcoinPaymentLogsIterator: ${paymentLogs.length} payment logs created`)
    logger.debug(paymentLogs)

    return paymentLogs
  }
}
