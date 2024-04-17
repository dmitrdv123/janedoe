import { ExchangeRate } from '@repo/dao/src/interfaces/exchange-rate'

export interface ExchangeRateWithId extends ExchangeRate {
  _id: string
}
