export interface ExchangeRateResponse {
  exchangeRate: number
}

export interface ExchangeRatesResponse {
  exchangeRates: {[timestamp: number]: number | null}
}
