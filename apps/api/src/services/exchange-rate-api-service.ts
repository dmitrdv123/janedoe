import { ExchangeRateDao } from '@repo/dao/dist/src/dao/exchange-rate.dao'

import { CURRENCY_USD, EXCHANGE_RATE_SAVING_SAMPLING_SECONDS } from '../constants'
import { logger } from '../utils/logger'
import { ExchangeRateApiWrapperService } from './exchange-rate-api-wrapper-service'

export interface ExchangeRateApiService {
  exchangeRate(currency: string, timestamp?: number | undefined): Promise<number | null>
  exchangeRates(currency: string, timestamps: number[]): Promise<{ [timestamp: number]: number | null }>
}

export class ExchangeRateApiServiceImpl implements ExchangeRateApiService {
  public constructor(
    private exchangeRateApiWrapperService: ExchangeRateApiWrapperService,
    private exchangeRateDao: ExchangeRateDao
  ) { }

  public async exchangeRate(currency: string, timestamp?: number | undefined): Promise<number | null> {
    logger.debug(`ExchangeRateApiService: start to find exchange rate for ${currency} and timestamp ${timestamp}`)

    if (currency.toLocaleLowerCase() === CURRENCY_USD) {
      logger.debug(`ExchangeRateApiService: exchange rate is 1`)
      return 1
    }

    const result = await this.loadExchangeRate(currency, timestamp)
    logger.debug(`ExchangeRateApiService: exchange rate is ${result}`)

    return result
  }

  public async exchangeRates(currency: string, timestamps: number[]): Promise<{ [timestamp: number]: number | null }> {
    logger.debug(`ExchangeRateApiService: start to find exchange rates for ${currency} and timestamps ${JSON.stringify(timestamps)}`)

    const exchangeRates: { [timestamp: number]: number | null } = {}
    const samplingExchangeRates: { [timestamp: number]: number | null } = {}
    const processed: { [samplingTimestamp: number]: boolean } = {}

    for (const timestamp of timestamps) {
      const samplingTimestamp = Math.floor(timestamp / EXCHANGE_RATE_SAVING_SAMPLING_SECONDS) * EXCHANGE_RATE_SAVING_SAMPLING_SECONDS
      if (!processed[samplingTimestamp]) {
        samplingExchangeRates[samplingTimestamp] = await this.exchangeRate(currency, samplingTimestamp)
        processed[samplingTimestamp] = true
      }

      exchangeRates[timestamp] = samplingExchangeRates[samplingTimestamp]
    }

    logger.debug('ExchangeRateApiService: end to find exchange rates')
    logger.debug(exchangeRates)

    return exchangeRates
  }

  private async loadExchangeRate(currency: string, timestamp?: number | undefined): Promise<number | null> {
    logger.debug(`ExchangeRateApiService: start to find exchange rate for currency ${currency} and timestamp ${timestamp}`)

    const timestampNow = Math.floor(Date.now() / 1000)
    const samplingTimestampNow = Math.floor(timestampNow / EXCHANGE_RATE_SAVING_SAMPLING_SECONDS) * EXCHANGE_RATE_SAVING_SAMPLING_SECONDS
    const timestampRequired = timestamp ?? timestampNow
    const samplingTimestamp = Math.floor(timestampRequired / EXCHANGE_RATE_SAVING_SAMPLING_SECONDS) * EXCHANGE_RATE_SAVING_SAMPLING_SECONDS

    logger.debug(`ExchangeRateApiService: start to load exchange rate for currency ${currency} and timestamp ${samplingTimestamp}`)
    const currencyExchangeRate = await this.exchangeRateDao.loadExchangeRate(currency, samplingTimestamp)
    if (currencyExchangeRate) {
      logger.debug(`ExchangeRateApiService: exchange rate for currency ${currency} and timestamp ${timestamp} is ${currencyExchangeRate.usdPrice}`)
      return currencyExchangeRate.usdPrice
    }

    logger.debug(`ExchangeRateApiService: exchange rate ${samplingTimestamp} not found`)
    if (Math.abs(samplingTimestamp - timestampNow) > EXCHANGE_RATE_SAVING_SAMPLING_SECONDS) {
      return null
    }

    logger.debug('ExchangeRateApiService: start to load exchange rates from api')
    const exchangeRates = await this.exchangeRateApiWrapperService.exchangeRates()
    logger.debug('ExchangeRateApiService: end to load exchange rates from api')
    logger.debug(exchangeRates)

    logger.debug('ExchangeRateApiService: start to save exchange rates')
    await this.exchangeRateDao.saveExchangeRates(
      Object.entries(exchangeRates.conversion_rates).map(([currency, exchangeRate]) => ({
        currency,
        usdPrice: exchangeRate,
        timestamp: samplingTimestampNow,
      }))
    )
    logger.debug('ExchangeRateApiService: end to save exchange rates')

    const matchingKey = Object.keys(exchangeRates.conversion_rates)
      .find(key => key.toLocaleLowerCase() === currency.toLocaleLowerCase())
    const exchangeRate = matchingKey ? exchangeRates.conversion_rates[matchingKey] : null
    logger.debug(`ExchangeRateApiService: exchange rate for currency ${currency} and timestamp ${timestamp} is ${exchangeRate}`)

    return exchangeRate
  }
}
