import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { PaymentSuccess } from '@repo/dao/dist/src/interfaces/payment-success'

import { logger } from '../utils/logger'

export interface PaymentSuccessService {
  savePaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number, currency: string, amountCurrency: number, email: string | null, language: string, description: string | null, comment: string | null): Promise<void>
  loadPaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number): Promise<PaymentSuccess | undefined>
}

export class PaymentSuccessServiceImpl implements PaymentSuccessService {
  public constructor(
    private paymentDao: PaymentDao
  ) { }

  public async savePaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number, currency: string, amountCurrency: number, email: string | null, language: string, description: string | null, comment: string | null): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000)

    const paymentSuccess: PaymentSuccess = {
      accountId,
      paymentId,
      timestamp,
      blockchain,
      transaction,
      index,
      currency,
      amountCurrency,
      email,
      language,
      description,
      comment
    }

    logger.debug('PaymentService: start to create payment success')
    logger.debug(paymentSuccess)
    await this.paymentDao.savePaymentSuccess(paymentSuccess)
    logger.debug('PaymentService: end to create payment success')
  }

  public async loadPaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number): Promise<PaymentSuccess | undefined> {
    logger.debug(`PaymentService: start to load payment success for account id ${accountId}, blockchain ${blockchain} and transaction ${transaction}`)
    const paymentSuccess = await this.paymentDao.loadPaymentSuccess(accountId, paymentId, blockchain, transaction, index)
    logger.debug('PaymentService: end to load payment success')
    logger.debug(paymentSuccess)

    return paymentSuccess
  }
}
