import { Asset, QuoteSimulationResult, Token } from 'rango-sdk-basic'
import { ApiRequestStatus } from './api-request'

export interface PaymentConversionData {
  amount: string
  quote: QuoteSimulationResult
}

export interface PaymentConversionResult {
  data?: PaymentConversionData
  status: ApiRequestStatus,
  error: Error | undefined,
  process: (
    from: Token,
    to: Asset | undefined,
    amountCurrency: number,
    slippage: number
  ) => Promise<PaymentConversionData | undefined>
}
