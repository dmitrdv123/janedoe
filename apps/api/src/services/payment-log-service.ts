import { PaymentLogDao } from '@repo/dao/dist/src/dao/payment-log.dao'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { PaymentFilter } from '@repo/dao/dist/src/interfaces/payment-filter'

export interface PaymentLogService {
  savePaymentLog(paymentLog: PaymentLog): Promise<void>
  listPaymentLogs(id: string, filter?: PaymentFilter): Promise<PaymentLog[]>
}

export class PaymentLogServiceImpl implements PaymentLogService {
  public constructor(
    private paymentLogDao: PaymentLogDao
  ) { }

  public async savePaymentLog(paymentLog: PaymentLog): Promise<void> {
    await this.paymentLogDao.savePaymentLog(paymentLog)
  }

  public async listPaymentLogs(id: string, filter?: PaymentFilter): Promise<PaymentLog[]> {
    return await this.paymentLogDao.listPaymentLogs(id, filter)
  }
}
