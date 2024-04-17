export interface PaymentLogKey {
  paymentId: string
  blockchain: string
  transaction: string
  index: number
  timestamp: number
}

export interface PaymentLog {
  paymentId: string
  block: string
  timestamp: number
  transaction: string
  index: number
  from: string | null
  to: string
  amount: string
  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
}
