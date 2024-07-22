import { SettingsDao } from '@repo/dao/dist/src/dao/settings.dao'
import { BlockchainSettings } from '@repo/dao/dist/src/interfaces/blockchain-settings'
import { AppSettings } from '@repo/dao/dist/src/interfaces/settings'
import { AccountPaymentSettings } from '@repo/dao/dist/src/interfaces/account-settings'
import { BlockchainEvmClientConfig } from '@repo/dao/dist/src/interfaces/blockchain-evm-client-config'
import { CacheService } from '@repo/common/dist/src/services/cache-service'

import { logger } from '../utils/logger'
import { APP_SETTINGS_PREFIX, BLOCKCHAIN_EVM_CLIENT_CONFIG_SETTINGS_PREFIX, BLOCKCHAIN_SETTINGS_PREFIX, DEFAULT_ACCOUNT_PAYMENT_SETTINGS_PREFIX, DEFAULT_SETTINGS_CACHING_SECONDS, EXCHANGE_RATE_SETTINGS_PREFIX, TOKEN_SETTINGS_PREFIX } from '../constants'
import { ExchangeRateSettings, TokenSettings } from '../interfaces/settings'

export interface SettingsService {
  loadAppSettings(): Promise<AppSettings>

  loadTokenSettings(): Promise<TokenSettings | undefined>
  saveTokenSettings(settings: TokenSettings): Promise<void>

  loadExchangeRateSettings(): Promise<ExchangeRateSettings | undefined>
  saveExchangeRateSettings(settings: ExchangeRateSettings): Promise<void>

  loadBlockchainSettings(blockchain: string): Promise<BlockchainSettings | undefined>
  saveBlockchainSettings(settings: BlockchainSettings): Promise<void>

  loadDefaultAccountPaymentSettings(): Promise<AccountPaymentSettings>
  loadBlockchainEvmClientConfigSettings(chainId: string): Promise<BlockchainEvmClientConfig | undefined>
}

export class SettingsServiceImpl implements SettingsService {
  public constructor(
    private cacheService: CacheService,
    private settingsDao: SettingsDao
  ) { }

  public async loadAppSettings(): Promise<AppSettings> {
    return this.cacheService.run(
      'settings#app_settings',
      DEFAULT_SETTINGS_CACHING_SECONDS,
      async () => {
        logger.debug('SettingsService: start to load app settings')
        const settings = await this.settingsDao.loadSettings<AppSettings>(APP_SETTINGS_PREFIX)
        if (!settings) {
          throw new Error('SettingsService: app settings not found')
        }
        logger.debug('SettingsService: end to load app settings')

        return settings
      }
    )


  }

  public async loadTokenSettings(): Promise<TokenSettings | undefined> {
    logger.debug('SettingsService: start to load token settings')
    const settings = await this.settingsDao.loadSettings<TokenSettings>(TOKEN_SETTINGS_PREFIX)
    logger.debug('SettingsService: end to get token settings')
    logger.debug(settings)

    return settings
  }

  public async saveTokenSettings(settings: TokenSettings): Promise<void> {
    logger.debug('SettingsService: start to save token settings')
    logger.debug(settings)
    await this.settingsDao.saveSettings(settings, TOKEN_SETTINGS_PREFIX)
    logger.debug('SettingsService: end to save token settings')
  }

  public async loadExchangeRateSettings(): Promise<ExchangeRateSettings | undefined> {
    logger.debug('SettingsService: start to load exchange rate settings')
    const settings = await this.settingsDao.loadSettings<ExchangeRateSettings>(EXCHANGE_RATE_SETTINGS_PREFIX)
    logger.debug('SettingsService: end to load exchange rate settings')
    logger.debug(settings)

    return settings
  }

  public async saveExchangeRateSettings(settings: ExchangeRateSettings): Promise<void> {
    logger.debug('SettingsService: start to save exchange rate settings')
    logger.debug(settings)
    await this.settingsDao.saveSettings(settings, EXCHANGE_RATE_SETTINGS_PREFIX)
    logger.debug('SettingsService: end to save exchange rate settings')
  }

  public async loadBlockchainSettings(blockchain: string): Promise<BlockchainSettings | undefined> {
    logger.debug('SettingsService: start to load blockchain settings')
    const settings = await this.settingsDao.loadSettings<BlockchainSettings>(BLOCKCHAIN_SETTINGS_PREFIX, blockchain)
    logger.debug('SettingsService: end to get blockchain settings')
    logger.debug(settings)

    return settings
  }

  public async saveBlockchainSettings(settings: BlockchainSettings): Promise<void> {
    logger.debug('SettingsService: start to save blockchain settings')
    logger.debug(settings)
    await this.settingsDao.saveSettings(settings, BLOCKCHAIN_SETTINGS_PREFIX, settings.blockchain)
    logger.debug('SettingsService: end to save blockchain settings')
  }

  public async loadDefaultAccountPaymentSettings(): Promise<AccountPaymentSettings> {
    logger.debug('SettingsService: start to load default account payment settings')
    const settings = await this.settingsDao.loadSettings<AccountPaymentSettings>(DEFAULT_ACCOUNT_PAYMENT_SETTINGS_PREFIX)
    if (!settings) {
      throw new Error('SettingsService: default account payment settings not found')
    }
    logger.debug('SettingsService: end to load default account payment settings')

    return settings
  }

  public async loadBlockchainEvmClientConfigSettings(chainId: string): Promise<BlockchainEvmClientConfig | undefined> {
    logger.debug('SettingsService: start to load default account payment settings')
    const settings = await this.settingsDao.loadSettings<BlockchainEvmClientConfig>(BLOCKCHAIN_EVM_CLIENT_CONFIG_SETTINGS_PREFIX, chainId)
    logger.debug('SettingsService: end to load default account payment settings')

    return settings
  }
}

