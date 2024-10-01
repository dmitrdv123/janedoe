import { ExchangeRate } from '@repo/dao/dist/src/interfaces/exchange-rate'
import { ExchangeRateDao } from '@repo/dao/dist/src/dao/exchange-rate.dao'

import { ExchangeRateModel } from '../models/exchange-rate.model'

export class ExchangeRateDaoImpl implements ExchangeRateDao {
  public async loadExchangeRate(currency: string, timestamp: number): Promise<ExchangeRate | undefined> {
    const currencyExchangeRate = await ExchangeRateModel
      .findById([currency.toLocaleLowerCase(), timestamp].join(':'))
    return currencyExchangeRate?.toJSON()
  }

  public async saveExchangeRates(exchangeRates: ExchangeRate[]): Promise<void> {
    await ExchangeRateModel.bulkWrite(
      exchangeRates.map(exchangeRate => ({
        updateOne: {
          filter: {
            _id: [exchangeRate.currency.toLocaleLowerCase(), exchangeRate.timestamp].join(':')
          },
          update: {
            currency: exchangeRate.currency,
            usdPrice: exchangeRate.usdPrice,
            timestamp: exchangeRate.timestamp,
          },
          upsert: true
        }
      }))
    )
  }
}
