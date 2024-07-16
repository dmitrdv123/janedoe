import { logger } from '../utils/logger'
import { Task } from './task-manager'
import { EXCHANGE_RATE_SAVING_SAMPLING_SECONDS } from '../constants'
import { SettingsService } from '../services/settings-service'
import { ExchangeRateApiService } from '../services/exchange-rate-api-service'
import { ExchangeRateApiWrapperService } from '../services/exchange-rate-api-wrapper-service'

export class ExchangeRateTask implements Task {
  public constructor(
    private exchangeRateApiService: ExchangeRateApiService,
    private exchangeRateApiWrapperService: ExchangeRateApiWrapperService,
    private settingsService: SettingsService
  ) { }

  public async run(): Promise<void> {
    try {
      logger.info('ExchangeRateTask: task start')

      logger.debug('ExchangeRateTask: start to get exchange rate settings')
      const exchangeRateSettings = await this.settingsService.loadExchangeRateSettings()
      logger.debug('ExchangeRateTask: end to get exchange rate settings')
      logger.debug(exchangeRateSettings)

      const timestampNow = Math.floor(Date.now() / 1000)
      const timestampSampling = Math.floor(timestampNow / EXCHANGE_RATE_SAVING_SAMPLING_SECONDS) * EXCHANGE_RATE_SAVING_SAMPLING_SECONDS

      if (!!exchangeRateSettings && exchangeRateSettings.timestamp >= timestampSampling) {
        logger.debug(`ExchangeRateTask: skip saving exchange rate since settings timestamp ${exchangeRateSettings.timestamp} is greater or equal current sampling timestamp ${timestampSampling}`)
        return
      }

      logger.debug(`ExchangeRateTask: start to get exchange rates`)
      const exchangeRates = await this.exchangeRateApiWrapperService.exchangeRates()
      logger.debug(`ExchangeRateTask: end to get exchange rates`)
      logger.debug(exchangeRates)

      logger.debug('ExchangeRateTask: start to save exchange rates')
      await this.exchangeRateApiService.saveExchangeRates(
        Object.entries(exchangeRates.conversion_rates).map(([currency, exchangeRate]) => ({
          currency,
          usdPrice: exchangeRate,
          timestamp: timestampSampling,
        }))
      )
      logger.debug('ExchangeRateTask: end to save exchange rates')

      logger.debug('ExchangeRateTask: start to save exchange rate settings')
      await this.settingsService.saveExchangeRateSettings({
        timestamp: timestampSampling
      })
      logger.debug('ExchangeRateTask: end to save exchange rate settings')
    } catch (error) {
      logger.error(`ExchangeRateTask: error happens`)
      logger.error(error)
    }
  }
}
