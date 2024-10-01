import { PaymentLogDirection } from './payment-log'

export interface IpnKey {
  accountId: string
  paymentId: string
  blockchain: string
  transaction: string
  index: number
}

export interface IpnData {
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
  amountCurrency: number | null

  totalAmountUsd: number | null
  totalAmountCurrency: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  tokenUsdPrice: number | null

  currency: string | null
  currencyExchangeRate: number | null
}

export interface IpnResult {
  timestamp: number
  status: number
  result: unknown,
  error: string | null
}
