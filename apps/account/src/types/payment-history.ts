import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { IpnResult } from './ipn'

export type PaymentHistoryDirection = 'incoming' | 'outgoing'

export interface PaymentHistory {
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: PaymentHistoryDirection

  amount: string
  amountUsd: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  tokenUsdPrice: number | null

  ipnResult: IpnResult | null
}

export interface PaymentHistoryFilter {
  paymentId: string | undefined
  timestampFrom: number | undefined
  timestampTo: number | undefined
  from: string | undefined
  to: string | undefined
  direction: PaymentHistoryDirection | undefined
  blockchains: string[] | undefined
  transaction: string | undefined
}

export interface PaymentHistoryResponse {
  totalSize: number
  data: PaymentHistory[]
}

export interface PaymentHistoryData {
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: PaymentHistoryDirection

  amount: string
  amountUsdAtPaymentTime: number | null
  amountUsdAtCurTime: number | null
  amountCurrencyAtPaymentTime: number | null
  amountCurrencyAtCurTime: number | null

  blockchain: BlockchainMeta | null
  blockchainName: string

  token: Token | null
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

export interface PaymentHistoryDataFilter {
  paymentId: string
  timestampFrom: string
  timestampTo: string
  from: string
  to: string
  direction: PaymentHistoryDirection | null
  blockchains: string[]
  transactionHash: string
}

export interface PaymentHistoryUpdatesResponse {
  size: number
}
