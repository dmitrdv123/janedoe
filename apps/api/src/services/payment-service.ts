import { Account } from '@repo/dao/dist/src/interfaces/account-profile'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { BitcoinService } from '@repo/bitcoin/dist/src/services/bitcoin.service'

import { BLOCKCHAIN_BTC } from '../constants'
import { logger } from '../utils/logger'
import { PaymentSettings } from '../interfaces/payment-settings'
import { Wallet } from '../interfaces/wallet'
import { PaymentHistory } from '../interfaces/payment-history'
import { PaymentLogService } from './payment-log-service'
import { AccountService } from './account-service'
import { PaymentResultService } from './payment-result-service'

export interface PaymentService {
  paymentSettings(id: string, paymentId: string): Promise<PaymentSettings>
  loadPaymentHistory(id: string, paymentId: string): Promise<PaymentHistory[]>

  saveSuccess(accountId: string, blockchain: string, txid: string, currency: string, amountCurrency: number, email: string, language: string): Promise<void>
}

export class PaymentServiceImpl implements PaymentService {
  public constructor(
    private accountService: AccountService,
    private bitcoinService: BitcoinService,
    private paymentLogService: PaymentLogService,
    private paymentResultService: PaymentResultService
  ) { }

  public async paymentSettings(id: string, paymentId: string): Promise<PaymentSettings> {
    logger.debug(`PaymentService: start to load account for id ${id}`)
    const account = await this.accountService.loadAccount(id)
    logger.debug('PaymentService: end to load account')

    if (!account) {
      logger.error(`PaymentService: account not found for ${id}`)
      throw new Error(`Account not found for ${id}`)
    }
    logger.debug(account)

    logger.debug(`PaymentService: start to process wallets for id ${id} and payment id ${paymentId}`)
    const wallets = await this.processWallets(id, paymentId, account)
    logger.debug('PaymentService: end to process wallets')
    logger.debug(wallets)

    return {
      wallets,
      assets: account.settings.paymentSettings.assets,
      description: account.settings.commonSettings.description,
      disableConversion: account.settings.paymentSettings.disableConversion
    }
  }

  public async saveSuccess(accountId: string, blockchain: string, txid: string, currency: string, amountCurrency: number, email: string, language: string): Promise<void> {
    const settings = await this.accountService.loadAccountSettings(accountId)

    logger.debug('PaymentService: start to create payment success info')
    await this.paymentResultService.saveSuccess(accountId, blockchain, txid, currency, amountCurrency, email, language, settings?.commonSettings.description ?? null, null)
    logger.debug('PaymentService: end to create payment success info')
  }

  public async loadPaymentHistory(id: string, paymentId: string): Promise<PaymentHistory[]> {
    logger.debug(`PaymentService: start to list payment logs for id ${id} and payment id ${paymentId}`)
    const paymentLogs = await this.paymentLogService.listPaymentLogs(id, { paymentId })
    logger.debug(`PaymentService: found ${paymentLogs.length} payment logs`)
    logger.debug(paymentLogs)

    logger.debug(`PaymentService: start to convert to payment history`)
    const paymentHistory = paymentLogs.map(paymentLog => this.convertPaymentLogToPaymentHistory(paymentLog))
    logger.debug(`PaymentService: end to convert to payment history`)
    logger.debug(paymentHistory)

    return paymentHistory
  }

  private async processWallets(id: string, paymentId: string, account: Account): Promise<Wallet[]> {
    const updatedWallets = await Promise.all(
      account.settings.paymentSettings.blockchains.map(async blockchain => {
        logger.debug(`PaymentService: start to process wallet for blockchain ${blockchain}`)

        let wallet: Wallet | undefined = undefined

        try {
          switch (blockchain.toLocaleLowerCase()) {
            case BLOCKCHAIN_BTC:
              const protocolPaymentId = id + paymentId

              logger.debug(`PaymentService: start to create bitcoin address for ${id} with protocols payment id ${protocolPaymentId}`)
              const walletAddress = await this.bitcoinService.createWalletAddress(id, protocolPaymentId)
              logger.debug(`PaymentService: bitcoin address ${walletAddress.data.address}`)

              wallet = {
                blockchain,
                address: walletAddress.data.address
              }
              break
            default:
              wallet = { blockchain, address: account.profile.address }
              break
          }
        } catch (error) {
          logger.error(`PaymentService: failed to process wallet for id ${id}, paymentId ${paymentId}, account ${account.profile.id} and blockchain ${blockchain}`)
          logger.error(error)
        }

        logger.debug('PaymentService: end to process wallet')
        logger.debug(wallet)

        return wallet
      })
    )

    return updatedWallets.filter(item => !!item) as Wallet[]
  }

  private convertPaymentLogToPaymentHistory(paymentLog: PaymentLog): PaymentHistory {
    const res: PaymentHistory = {
      id: paymentLog.accountId,
      paymentId: paymentLog.paymentId,

      block: paymentLog.block,
      timestamp: paymentLog.timestamp,
      transaction: paymentLog.transaction,
      index: paymentLog.index,

      from: paymentLog.from,
      to: paymentLog.to,
      direction: paymentLog.direction,
      amount: paymentLog.amount,
      amountUsd: paymentLog.amountUsd,

      blockchain: paymentLog.blockchain,
      tokenAddress: paymentLog.tokenAddress,
      tokenSymbol: paymentLog.tokenSymbol,
      tokenDecimals: paymentLog.tokenDecimals,
      tokenUsdPrice: paymentLog.tokenUsdPrice,

      comment: null,

      ipnResult: null
    }

    return res
  }
}
