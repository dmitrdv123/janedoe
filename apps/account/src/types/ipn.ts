export interface Ipn {
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
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
  result: unknown,
  status: number,
  error: string | null
}
