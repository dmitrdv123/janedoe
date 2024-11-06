import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import appConfig from '@repo/common/dist/src/app-config'

import { EmailService } from '../email-service'
import { EmailTemplateService } from '../email-template-service'
import { NotificationObserver } from './notification-observer'
import { PaymentSuccessService } from '../payment-success-service'
import { logger } from '../../utils/logger'

export class PaymentStatusNotificationObserver implements NotificationObserver {
  public constructor(
    private paymentSuccessService: PaymentSuccessService,
    private emailService: EmailService,
    private emailTemplateService: EmailTemplateService,
  ) { }

  public async notify<T>(notification: Notification<T>): Promise<boolean> {
    if (notification.notificationType !== NotificationType.PAYMENT) {
      logger.debug(`PaymentStatusNotificationObserver: skip notification ${notification.notificationType} processing`)
      return false
    }

    const paymentLog = notification.data as PaymentLog

    logger.debug(`PaymentStatusNotificationObserver: start to load payment success for account id ${paymentLog.accountId} and payment id ${paymentLog.paymentId}`)
    const paymentSuccess = await this.paymentSuccessService.loadPaymentSuccess(
      paymentLog.accountId, paymentLog.paymentId, paymentLog.blockchain, paymentLog.transaction, paymentLog.index
    )

    if (!paymentSuccess) {
      logger.debug('PaymentStatusNotificationObserver: payment success not found')
      return false
    }

    logger.debug('PaymentStatusNotificationObserver: payment success')
    logger.debug(paymentSuccess)

    const emailAddress = paymentSuccess.email?.trim()
    if (emailAddress && emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      const emailContent = await this.emailTemplateService.paymentNotificationEmail(
        paymentLog.accountId, paymentLog.paymentId, paymentSuccess.currency, paymentSuccess.amountCurrency, paymentSuccess.language, paymentSuccess.description ?? '', [paymentLog]
      )

      logger.debug(`PaymentStatusNotificationObserver: start to send email to ${emailAddress} with subject "${emailContent.subject}"`)
      await this.emailService.sendEmail(appConfig.PAYMENT_NOTIFICATION_FROM_EMAIL, emailAddress, emailContent.subject, emailContent.body)
      logger.debug('PaymentStatusNotificationObserver: end to send email')
    } else {
      logger.debug('PaymentStatusNotificationObserver: email address is not valid or no set')
    }

    return true
  }
}