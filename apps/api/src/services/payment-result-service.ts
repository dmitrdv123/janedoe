import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { PaymentSuccessInfo } from '@repo/dao/dist/src/interfaces/payment-success-info'

import { logger } from '../utils/logger'

export interface PaymentResultService {
  saveSuccess(accountId: string, blockchain: string, txid: string, currency: string, amountCurrency: number, email: string | null, language: string, description: string | null, comment: string | null): Promise<void>
  loadSuccess(accountId: string, blockchain: string, txid: string): Promise<PaymentSuccessInfo | undefined>
  removeSuccess(accountId: string, blockchain: string, txid: string): Promise<void>
}

export class PaymentResultServiceImpl implements PaymentResultService {
  public constructor(
    private paymentDao: PaymentDao
  ) { }

  public async saveSuccess(accountId: string, blockchain: string, txid: string, currency: string, amountCurrency: number, email: string | null, language: string, description: string | null, comment: string | null): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000)

    const paymentSuccessInfo: PaymentSuccessInfo = {
      timestamp,
      blockchain,
      txid,
      currency,
      amountCurrency,
      email,
      language,
      description,
      comment
    }

    logger.debug('PaymentService: start to create payment success info')
    logger.debug(paymentSuccessInfo)
    await this.paymentDao.saveSuccess(accountId, blockchain, txid, paymentSuccessInfo)
    logger.debug('PaymentService: end to create payment success info')
  }

  public async loadSuccess(accountId: string, blockchain: string, txid: string): Promise<PaymentSuccessInfo | undefined> {
    logger.debug(`PaymentService: start to load payment success info for account id ${accountId}, blockchain ${blockchain} and txid ${txid}`)
    const paymentSuccessInfo = await this.paymentDao.loadSuccess(accountId, blockchain, txid)
    logger.debug('PaymentService: end to load payment success info')
    logger.debug(paymentSuccessInfo)

    return paymentSuccessInfo
  }

  public async removeSuccess(accountId: string, blockchain: string, txid: string): Promise<void> {
    logger.debug(`PaymentService: start to delete payment success info for account id ${accountId}, blockchain ${blockchain} and txid ${txid}`)
    await this.paymentDao.deleteSuccess(accountId, blockchain, txid)
    logger.debug('PaymentService: end to delete payment success info')
  }
}
