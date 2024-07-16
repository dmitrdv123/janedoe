import { IpnData } from '@repo/dao/dist/src/interfaces/ipn'
import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'

import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

import { NotificationObserver } from './notification-observer'
import { logger } from '../../utils/logger'
import { IpnService } from '../ipn-service'
import { ExchangeRateApiService } from '../exchange-rate-api-service'
import { COMMON_SETTINGS_DEFAULT_CURRENCY, DEFAULT_FIAT_DECIMAL_PLACES } from '../../constants'
import { AccountService } from '../account-service'
import { roundNumber } from '../../utils/utils'
import { PaymentService } from '../payment-service'

export class IpnNotificationObserver implements NotificationObserver {
  public constructor(
    private accountService: AccountService,
    private paymentService: PaymentService,
    private ipnService: IpnService,
    private exchangeRateApiService: ExchangeRateApiService
  ) { }

  public async notify<T>(notification: Notification<T>): Promise<boolean> {
    if (notification.notificationType !== NotificationType.IPN) {
      logger.debug(`IpnNotificationObserver: skip notification ${notification.notificationType} processing`)
      return false
    }

    const paymentLog = notification.data as PaymentLog

    logger.debug(`IpnNotificationObserver: start to load settings for id ${paymentLog.accountId}`)
    const settings = await this.accountService.loadAccountSettings(paymentLog.accountId)
    logger.debug('IpnNotificationObserver: end to load settings')
    logger.debug(settings)

    const payments = await this.paymentService.loadPaymentHistory(paymentLog.accountId, paymentLog.paymentId)
    const totalAmountUsd = payments.reduce((acc, cur) => {
      if (cur.amountUsd) {
        acc = acc ? acc + cur.amountUsd : cur.amountUsd
      }

      return acc
    }, null as number | null)

    const amountCurrencies = await Promise.all(
      payments.map(async payment => {
        const currencyExchangeRate = await this.exchangeRateApiService.exchangeRate(currency, payment.timestamp)
        return payment.amountUsd && currencyExchangeRate
          ? payment.amountUsd * currencyExchangeRate
          : null
      })
    )
    const totalAmountCurrency = amountCurrencies.reduce((acc, cur) => {
      if (cur) {
        acc = acc ? acc + cur : cur
      }

      return acc
    }, null as number | null)

    const currency = settings?.commonSettings.currency ?? COMMON_SETTINGS_DEFAULT_CURRENCY
    const currencyExchangeRate = await this.exchangeRateApiService.exchangeRate(currency, paymentLog.timestamp)
    const amountCurrency = paymentLog.amountUsd && currencyExchangeRate
      ? paymentLog.amountUsd * currencyExchangeRate
      : null

    const ipn: IpnData = {
      accountId: paymentLog.accountId,
      paymentId: paymentLog.paymentId,

      block: paymentLog.block,
      timestamp: paymentLog.timestamp,
      transaction: paymentLog.transaction,
      index: paymentLog.index,

      from: paymentLog.from,
      to: paymentLog.to,
      amount: paymentLog.amount,
      amountUsd: paymentLog.amountUsd === null ? null : roundNumber(paymentLog.amountUsd, DEFAULT_FIAT_DECIMAL_PLACES),
      amountCurrency: amountCurrency === null ? null : roundNumber(amountCurrency, DEFAULT_FIAT_DECIMAL_PLACES),

      totalAmountUsd: totalAmountUsd === null ? null : roundNumber(totalAmountUsd, DEFAULT_FIAT_DECIMAL_PLACES),
      totalAmountCurrency: totalAmountCurrency === null ? null : roundNumber(totalAmountCurrency, DEFAULT_FIAT_DECIMAL_PLACES),

      blockchain: paymentLog.blockchain,
      tokenAddress: paymentLog.tokenAddress,
      tokenSymbol: paymentLog.tokenSymbol,
      tokenDecimals: paymentLog.tokenDecimals,
      tokenUsdPrice: paymentLog.tokenUsdPrice,
      currency: currency,
      currencyExchangeRate: currencyExchangeRate
    }
    logger.debug('IpnNotificationObserver: ipn')
    logger.debug(ipn)

    logger.debug('IpnNotificationObserver: start to save ipn')
    await this.ipnService.saveIpnData(ipn)
    logger.debug('IpnNotificationObserver: end to save ipn')

    if (settings?.notificationSettings.callbackUrl) {
      logger.debug(`IpnNotificationObserver: start to send ipn request to ${settings.notificationSettings.callbackUrl}`)
      const ipnResult = await this.ipnService.trySendIpnRequest(settings.notificationSettings.callbackUrl, ipn, settings.notificationSettings.secretKey)
      logger.debug('IpnNotificationObserver: end to send ipn request')
      logger.debug(ipnResult)
    }

    return true
  }
}
