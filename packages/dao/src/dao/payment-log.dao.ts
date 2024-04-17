import { PaymentLog } from '../interfaces/payment-log'
import { PaymentFilter } from '../interfaces/payment-filter'

export interface PaymentLogDao {
  savePaymentLog(paymentLog: PaymentLog): Promise<void>
  listPaymentLogs(id: string, filter?: PaymentFilter): Promise<PaymentLog[]>
}
