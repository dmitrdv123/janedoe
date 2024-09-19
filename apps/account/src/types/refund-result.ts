import { PaymentHistoryData } from './payment-history'

export interface RefundResult {
  paymentHistory: PaymentHistoryData
  hash: string | undefined
}
