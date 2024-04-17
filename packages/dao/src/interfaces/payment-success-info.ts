export interface PaymentSuccessInfo {
  timestamp: number
  blockchain: string
  email: string
  currency: string
  amountCurrency: number
  description: string | null
  language: string
}
