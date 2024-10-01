import { ExchangeRate } from '@repo/dao/dist/src/interfaces/exchange-rate'

export interface ExchangeRateWithId extends ExchangeRate {
  _id: string
}
