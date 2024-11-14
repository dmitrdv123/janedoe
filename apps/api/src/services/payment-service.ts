import { Account } from '@repo/dao/dist/src/interfaces/account-profile'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { BitcoinService } from '@repo/bitcoin/dist/src/services/bitcoin.service'
import { createProtocolPaymentId } from '@repo/common/dist/src/utils/utils'

import { BLOCKCHAIN_BTC } from '../constants'
import { logger } from '../utils/logger'
import { PaymentSettings } from '../interfaces/payment-settings'
import { Wallet } from '../interfaces/wallet'
import { PaymentLogService } from './payment-log-service'
import { AccountService } from './account-service'
import { PaymentSuccessService } from './payment-success-service'

export interface PaymentService {
  paymentSettings(id: string, paymentId: string): Promise<PaymentSettings>
  listPaymentLogs(id: string, paymentId: string): Promise<PaymentLog[]>
  savePaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number, currency: string, amountCurrency: number, email: string, language: string): Promise<void>
}

export class PaymentServiceImpl implements PaymentService {
  public constructor(
    private accountService: AccountService,
    private bitcoinService: BitcoinService,
    private paymentLogService: PaymentLogService,
    private paymentSuccessService: PaymentSuccessService
  ) { }

  public async paymentSettings(accountId: string, paymentId: string): Promise<PaymentSettings> {
    logger.debug(`PaymentService: start to load account for account Id ${accountId}`)
    const account = await this.accountService.loadAccount(accountId)
    logger.debug('PaymentService: end to load account')

    if (!account) {
      logger.error(`PaymentService: account not found for ${accountId}`)
      throw new Error(`Account not found for ${accountId}`)
    }
    logger.debug(account)

    logger.debug(`PaymentService: start to process wallets for account Id ${accountId} and payment Id ${paymentId}`)
    const wallets = await this.processWallets(accountId, paymentId, account)
    logger.debug('PaymentService: end to process wallets')
    logger.debug(wallets)

    return {
      wallets,
      assets: account.settings.paymentSettings.assets,
      description: account.settings.commonSettings.description,
      disableConversion: account.settings.paymentSettings.disableConversion
    }
  }

  public async savePaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number, currency: string, amountCurrency: number, email: string, language: string): Promise<void> {
    const settings = await this.accountService.loadAccountSettings(accountId)

    logger.debug('PaymentService: start to create payment result')
    await this.paymentSuccessService.savePaymentSuccess(
      accountId, paymentId, blockchain, transaction, index, currency, amountCurrency, email, language, settings?.commonSettings.description ?? null, null
    )
    logger.debug('PaymentService: end to create payment result')
  }

  public async listPaymentLogs(accountId: string, paymentId: string): Promise<PaymentLog[]> {
    logger.debug(`PaymentService: start to list payment history for account Id ${accountId} and payment id ${paymentId}`)
    const paymentLogs = await this.paymentLogService.listPaymentLogs(accountId, { paymentId, direction: 'incoming' })
    logger.debug(`PaymentService: found ${paymentLogs.length} payment history`)
    logger.debug(paymentLogs)

    return paymentLogs
  }

  private async processWallets(id: string, paymentId: string, account: Account): Promise<Wallet[]> {
    const updatedWallets = await Promise.all(
      account.settings.paymentSettings.blockchains.map(async blockchain => {
        logger.debug(`PaymentService: start to process wallet for blockchain ${blockchain}`)

        let wallet: Wallet | undefined = undefined

        try {
          switch (blockchain.toLocaleLowerCase()) {
            case BLOCKCHAIN_BTC:
              const protocolPaymentId = createProtocolPaymentId(id, paymentId)

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
}
