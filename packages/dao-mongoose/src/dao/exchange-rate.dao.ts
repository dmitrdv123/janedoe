import { ExchangeRate } from '@repo/dao/src/interfaces/exchange-rate'
import { ExchangeRateModel } from '../models/exchange-rate.model'

import { ExchangeRateDao } from '@repo/dao/src/dao/exchange-rate.dao'

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
