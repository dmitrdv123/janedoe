import { BlockchainMeta, Token } from 'rango-sdk-basic'

export type PaymentLogDirection = 'incoming' | 'outgoing'

export interface PaymentLog {
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
}

export interface PaymentLogResponse {
  data: PaymentLog[]
}

export interface PaymentLogData {
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
}
