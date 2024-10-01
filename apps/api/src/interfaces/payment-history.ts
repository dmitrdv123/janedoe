import { IpnResult } from '@repo/dao/dist/src/interfaces/ipn'
import { PaymentLogDirection } from '@repo/dao/dist/src/interfaces/payment-log'

export interface PaymentHistory {
  id: string
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

  ipnResult: IpnResult | null
}

export interface PaymentHistoryResponse {
  totalSize: number
  data: PaymentHistory[]
}

export interface PaymentHistoryData {
  id: string
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: PaymentLogDirection

  amount: string
  amountUsdAtPaymentTime: number | null
  amountUsdAtCurTime: number | null
  amountCurrencyAtPaymentTime: number | null
  amountCurrencyAtCurTime: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null

  tokenUsdPriceAtPaymentTime: number | null
  tokenUsdPriceAtCurTime: number | null

  currency: string | null
  currencyExchangeRateAtPaymentTime: number | null
  currencyExchangeRateAtCurTime: number | null

  ipnResult: IpnResult | null
}
