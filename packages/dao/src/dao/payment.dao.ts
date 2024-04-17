import { PaymentSuccessInfo } from '../interfaces/payment-success-info'

export interface PaymentDao {
  saveSuccess(accountId: string, paymentId: string, paymentSuccessInfo: PaymentSuccessInfo): Promise<void>
  loadSuccess(accountId: string, paymentId: string): Promise<PaymentSuccessInfo | undefined>
  deleteSuccess(accountId: string, paymentId: string): Promise<void>
}
