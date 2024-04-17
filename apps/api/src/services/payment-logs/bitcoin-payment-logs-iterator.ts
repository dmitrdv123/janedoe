
import { BlockchainMeta } from 'rango-sdk-basic'

import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { BitcoinService } from '@repo/common/dist/src/services/bitcoin-service'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'
import appConfig from '@repo/common/dist/src/app-config'

import { BLOCKCHAIN_BTC, BLOCKCHAIN_BTC_NATIVE_TOKEN_DECIMALS } from '../../constants'
import { PaymentLogsIterator } from './payment-logs-iterator'
import { logger } from '../../utils/logger'
import { parseToBigNumber, tokenAmountToUsd } from '../../utils/utils'
import { MetaService } from '../meta-service'

export class BitcoinPaymentLogsIterator implements PaymentLogsIterator {
  private blockhash: string = ''

  public constructor(
    private blockchain: BlockchainMeta,
    private bitcoinService: BitcoinService,
    private metaService: MetaService
  ) {
  }

  public lastProcessed(): string {
    return this.blockhash
  }

  public skip(lastProcessed: string): void {
    this.blockhash = lastProcessed
  }

  public async nextBatch(): Promise<PaymentLog[]> {
    logger.debug('BitcoinPaymentLogsIterator: start to process next batch')

    logger.debug(`BitcoinPaymentLogsIterator: start to list transactions for wallet ${appConfig.BITCOIN_CENTRAL_WALLET} since block ${this.blockhash}`)
    const result = await this.bitcoinService.listBitcoinTransactionsSinceBlock(
      appConfig.BITCOIN_CENTRAL_WALLET,
      this.blockhash
    )
    logger.debug(`BitcoinPaymentLogsIterator: found ${result.transactions.length} transactions and last processed blockhash ${result.lastblock}`)

    this.blockhash = result.lastblock
    if (!result.transactions.length) {
      return []
    }

    const tokensByTimestamp = result.transactions.map(tx => ({
      timestamp: tx.time,
      blockchain: this.blockchain.name,
      address: null
    }))
    const tokensAtTxTime = await this.metaService.loadTokens(tokensByTimestamp)

    const paymentLogs = result.transactions
      .map((tx, i) => {
        const tokenAtTxTime = tokensAtTxTime[i]
        const amount = parseToBigNumber(tx.amount, BLOCKCHAIN_BTC_NATIVE_TOKEN_DECIMALS).toString()
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
          to: tx.address,
          amount: amount,
          amountUsd: amountUsd ?? null,

          block: tx.blockhash,
          timestamp: tx.time,
          transaction: tx.txid,
          index: tx.blockindex,
        }

        return paymentLog
      })

    logger.debug(`BitcoinPaymentLogsIterator: ${paymentLogs.length} payment logs created`)
    logger.debug(paymentLogs)

    return paymentLogs
  }
}
