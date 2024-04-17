import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

import { EmailService } from '../email-service'
import { EmailTemplateService } from '../email-template-service'
import { NotificationObserver } from './notification-observer'
import { PaymentService } from '../payment-service'
import { logger } from '../../utils/logger'

export class PaymentStatusNotificationObserver implements NotificationObserver {
  public constructor(
    private paymentService: PaymentService,
    private emailService: EmailService,
    private emailTemplateService: EmailTemplateService,
  ) { }

  public async notify<T>(notification: Notification<T>): Promise<boolean> {
    if (notification.notificationType !== NotificationType.PAYMENT) {
      logger.debug(`PaymentStatusNotificationObserver: skip notification ${notification.notificationType} processing`)
      return false
    }

    const paymentLog = notification.data as PaymentLog

    logger.debug(`PaymentStatusNotificationObserver: start to load success data for account id ${paymentLog.accountId} and payment id ${paymentLog.paymentId}`)
    const successData = await this.paymentService.loadSuccess(paymentLog.accountId, paymentLog.paymentId)

    if (!successData) {
      logger.debug('PaymentStatusNotificationObserver: success data not found')
      return false
    }

    logger.debug('PaymentStatusNotificationObserver: success data')
    logger.debug(successData)

    const emailAddress = successData.email.trim()
    if (emailAddress && emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      const emailContent = await this.emailTemplateService.paymentNotificationEmail(paymentLog.accountId, paymentLog.paymentId, successData.currency, successData.amountCurrency, successData.language, successData.description ?? '', [paymentLog])

      logger.debug(`PaymentStatusNotificationObserver: start to send email to ${emailAddress} with subject "${emailContent.subject}"`)
      await this.emailService.sendEmail(emailAddress, emailContent.subject, emailContent.body)
      logger.debug('PaymentStatusNotificationObserver: end to send email')
    } else {
      logger.debug('PaymentStatusNotificationObserver: email address is not valid or no set')
    }

    logger.debug(`PaymentStatusNotificationObserver: start to remove success data for account id ${paymentLog.accountId} and payment id ${paymentLog.paymentId}`)
    await this.paymentService.removeSuccess(paymentLog.accountId, paymentLog.paymentId)
    logger.debug('PaymentStatusNotificationObserver: end to remove success data')

    return true
  }
}