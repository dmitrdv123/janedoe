import { PaymentHistoryData } from '../interfaces/payment-history'
import { PaymentLogService } from './payment-log-service'
import { convertPaymentHistoryToPaymentHistoryData } from '../utils/utils'
import { ExchangeRateApiService } from './exchange-rate-api-service'
import { logger } from '../utils/logger'
import { COMMON_SETTINGS_DEFAULT_CURRENCY } from '../constants'
import { AccountService } from './account-service'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { MetaService } from './meta-service'
import { SettingsService } from './settings-service'

export interface ApiService {
  loadPaymentHistory(id: string, from: number | undefined, to: number | undefined): Promise<PaymentHistoryData[]>
  loadBlockchains(): Promise<BlockchainMeta[]>
  loadTokens(): Promise<Token[]>
}

export class ApiServiceImpl implements ApiService {
  public constructor(
    private settingsService: SettingsService,
    private accountService: AccountService,
    private paymentLogService: PaymentLogService,
    private exchangeRateApiService: ExchangeRateApiService,
    private metaService: MetaService
  ) { }

  public async loadPaymentHistory(id: string, from?: number | undefined, to?: number | undefined): Promise<PaymentHistoryData[]> {
    logger.debug(`ApiService: start to load payment history for id ${id} from ${from} to ${to}`)

    const [settings, paymentHistory, meta] = await Promise.all([
      this.accountService.loadAccountSettings(id),
      this.paymentLogService.listPaymentHistory(id, { timestampFrom: from, timestampTo: to }),
      this.metaService.meta()
    ])

    const now = Math.floor(Date.now() / 1000)
    const timestamps = paymentHistory.map(item => item.timestamp)
    const currency = settings?.commonSettings.currency ?? COMMON_SETTINGS_DEFAULT_CURRENCY
    const currencyExchangeRates = await this.exchangeRateApiService.exchangeRates(currency, [...timestamps, now])

    const paymentHistoryData = paymentHistory.map(item => convertPaymentHistoryToPaymentHistoryData(
      item,
      meta,
      currency,
      currencyExchangeRates[now],
      currencyExchangeRates
    ))

    logger.debug('ApiService: end to load payment history')
    logger.debug(paymentHistoryData)

    return paymentHistoryData
  }

  public async loadBlockchains(): Promise<BlockchainMeta[]> {
    const [settings, meta] = await Promise.all([
      this.settingsService.loadAppSettings(),
      this.metaService.meta()
    ])

    return settings.paymentBlockchains.map(
      paymentBlockchain => meta.blockchains.find(
        blockchain => blockchain.name.toLocaleLowerCase() === paymentBlockchain.blockchain.toLocaleLowerCase()
      )
    ).filter(item => !!item) as BlockchainMeta[]
  }

  public async loadTokens(): Promise<Token[]> {
    const [settings, meta] = await Promise.all([
      this.settingsService.loadAppSettings(),
      this.metaService.meta()
    ])

    return meta.tokens.filter(token => settings.paymentBlockchains.findIndex(
      item => item.blockchain.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
    ) !== -1)
  }
}
