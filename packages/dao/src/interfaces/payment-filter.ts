import { PaymentLogDirection } from './payment-log'

export interface PaymentFilter {
  paymentId?: string
  timestampFrom?: number
  timestampTo?: number
  from?: string
  to?: string
  direction?: PaymentLogDirection
  blockchains?: string[]
  transaction?: string
}
