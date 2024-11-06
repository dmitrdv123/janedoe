import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { PaymentFilter } from '@repo/dao/dist/src/interfaces/payment-filter'
import { PaymentHistory } from '@repo/dao/dist/src/interfaces/payment-history'

export interface PaymentLogService {
  savePaymentLog(paymentLog: PaymentLog): Promise<void>
  listPaymentLogs(accountId: string, filter?: PaymentFilter): Promise<PaymentLog[]>
  listPaymentHistory(accountId: string, filter?: PaymentFilter): Promise<PaymentHistory[]>
}

export class PaymentLogServiceImpl implements PaymentLogService {
  public constructor(
    private paymentDao: PaymentDao
  ) { }

  public async savePaymentLog(paymentLog: PaymentLog): Promise<void> {
    await this.paymentDao.savePaymentLog(paymentLog)
  }

  public async listPaymentLogs(accountId: string, filter?: PaymentFilter): Promise<PaymentLog[]> {
    return await this.paymentDao.listPaymentLogs(accountId, filter)
  }

  public async listPaymentHistory(accountId: string, filter?: PaymentFilter): Promise<PaymentHistory[]> {
    return await this.paymentDao.listPaymentHistory(accountId, filter)
  }
}
