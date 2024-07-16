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
      logger.info('MetaTask: task start')

      logger.debug('MetaTask: start to get token settings')
      const tokenSettings = await this.settingsService.loadTokenSettings()
      logger.debug('MetaTask: end to get token settings')
      logger.debug(tokenSettings)

      const timestampNow = Math.floor(Date.now() / 1000)
      const timestampSampling = Math.floor(timestampNow / META_SAVING_SAMPLING_SECONDS) * META_SAVING_SAMPLING_SECONDS
      if (!!tokenSettings && tokenSettings.timestamp >= timestampSampling) {
        logger.debug(`MetaTask: skip saving tokens since settings timestamp ${tokenSettings.timestamp} is greater or equal current sampling timestamp ${timestampSampling}`)
        return
      }

      logger.debug(`MetaTask: start to get meta`)
      const meta = await this.metaService.meta()
      logger.debug(`MetaTask: found ${meta.tokens.length} tokens`)

      logger.debug(`MetaTask: start to save ${meta.tokens.length} tokens`)
      await this.metaService.saveTokens(timestampSampling, meta.tokens)
      logger.debug(`MetaTask: end to save tokens`)

      logger.debug('MetaTask: start to save token settings')
      await this.settingsService.saveTokenSettings({
        timestamp: timestampSampling
      })
      logger.debug('MetaTask: end to save token settings')
    } catch (error) {
      logger.error(`MetaTask: error happens`)
      logger.error(error)
    }
  }
}
