import { ExchangeRate } from '../interfaces/exchange-rate'

export interface ExchangeRateDao {
  loadExchangeRate(currency: string, timestamp: number): Promise<ExchangeRate | undefined>
  saveExchangeRates(exchangeRates: ExchangeRate[]): Promise<void>
}
