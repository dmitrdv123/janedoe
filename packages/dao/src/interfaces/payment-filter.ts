export interface PaymentFilter {
  paymentId?: string
  timestampFrom?: number
  timestampTo?: number
  from?: string
  to?: string
  blockchains?: string[]
  transaction?: string
}
