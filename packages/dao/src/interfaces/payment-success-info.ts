export interface PaymentSuccessInfo {
  timestamp: number
  blockchain: string
  txid: string
  email: string | null
  language: string
  currency: string
  amountCurrency: number
  description: string | null
  comment: string | null
}
