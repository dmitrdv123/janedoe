import { logger } from '../utils/logger'
import { Task } from './task-manager'
import { MetaService } from '../services/meta-service'
import { META_SAVING_SAMPLING_SECONDS } from '../constants'
import { SettingsService } from '../services/settings-service'

export class MetaTask implements Task {
  public constructor(
    private metaService: MetaService,
    private settingsService: SettingsService
  ) { }

  public async run(): Promise<void> {
    try {
      logger.debug('MetaTask: task start')

      logger.debug('MetaTask: start to get token settings')
      const tokenSettings = await this.settingsService.loadTokenSettings()
      logger.debug('MetaTask: end to get token settings')
      logger.debug(tokenSettings)

      const timestampNow = Math.floor(Date.now() / 1000)
      const timestampNowSampling = Math.floor(timestampNow / META_SAVING_SAMPLING_SECONDS) * META_SAVING_SAMPLING_SECONDS
      if (!!tokenSettings && tokenSettings.timestamp >= timestampNowSampling) {
        logger.debug(`MetaTask: skip saving tokens since settings timestamp ${tokenSettings.timestamp} is greater or equal current sampling timestamp ${timestampNowSampling}`)
        return
      }

      logger.debug(`MetaTask: start to get meta and app settings`)
      const [meta, appSettings] = await Promise.all([
        this.metaService.meta(),
        this.settingsService.loadAppSettings()
      ])
      logger.debug(`MetaTask: end to get meta and app settings`)
      logger.debug(`MetaTask: found ${meta.tokens.length} tokens`)

      logger.debug(`MetaTask: start to filter tokens by payment blockchains`)
      const tokens = meta.tokens.filter(token =>
        appSettings.paymentBlockchains.some(paymentBlockchain =>
          paymentBlockchain.blockchain.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
        )
      )
      logger.debug(`MetaTask: filtered tokens count ${tokens.length}`);

      logger.debug(`MetaTask: start to save ${tokens.length} tokens`)
      await this.metaService.saveTokens(timestampNowSampling, tokens)
      logger.debug(`MetaTask: end to save tokens`)

      logger.debug('MetaTask: start to save token settings')
      await this.settingsService.saveTokenSettings({
        timestamp: timestampNowSampling
      })
      logger.debug('MetaTask: end to save token settings')
    } catch (error) {
      logger.error(`MetaTask: error happens`)
      logger.error(error)
    }
  }
}
