import { PaymentSuccessInfo } from '../interfaces/payment-success-info'

export interface PaymentDao {
  saveSuccess(accountId: string, blockchain: string, txid: string, paymentSuccessInfo: PaymentSuccessInfo): Promise<void>
  loadSuccess(accountId: string, blockchain: string, txid: string): Promise<PaymentSuccessInfo | undefined>
}
