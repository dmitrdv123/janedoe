import { IpnResult } from './ipn'
import { PaymentLogDirection } from './payment-log'
import { PaymentSuccess } from './payment-success'

export interface PaymentHistoryFilter {
  paymentId?: string
  timestampFrom?: number
  timestampTo?: number
  from?: string
  to?: string
  direction?: PaymentLogDirection
  blockchains?: string[]
  transaction?: string
  comment?: string
}

export interface PaymentHistory {
  accountId: string
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: PaymentLogDirection

  amount: string
  amountUsd: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  tokenUsdPrice: number | null

  paymentSuccess: PaymentSuccess | null
  ipnResult: IpnResult | null
}
