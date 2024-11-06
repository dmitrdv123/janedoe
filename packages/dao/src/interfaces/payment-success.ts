export interface PaymentSuccess {
  accountId: string
  paymentId: string

  timestamp: number
  blockchain: string
  transaction: string
  index: number

  email: string | null
  language: string
  currency: string
  amountCurrency: number
  description: string | null
  comment: string | null
}

export interface PaymentSuccessFilter {
  comment?: string
}
