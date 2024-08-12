import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { SupportTicketWithId } from '@repo/dao/dist/src/interfaces/support-ticket'
import appConfig from '@repo/common/dist/src/app-config'

import { EmailService } from '../email-service'
import { EmailTemplateService } from '../email-template-service'
import { NotificationObserver } from './notification-observer'
import { logger } from '../../utils/logger'

export class SupportNotificationObserver implements NotificationObserver {
  public constructor(
    private emailService: EmailService,
    private emailTemplateService: EmailTemplateService,
  ) { }

  public async notify<T>(notification: Notification<T>): Promise<boolean> {
    if (notification.notificationType !== NotificationType.SUPPORT) {
      logger.info(`SupportObserver: skip notification ${notification.notificationType} processing`)
      return false
    }

    const supportTicket = notification.data as SupportTicketWithId

    logger.info('SupportObserver: support ticket')
    logger.info(supportTicket)

    const emailContent = await this.emailTemplateService.supportNotificationEmail(supportTicket.id, supportTicket)

    logger.info(`SupportObserver: start to send email with subject "${emailContent.subject}"`)
    await this.emailService.sendEmail(appConfig.PAYMENT_NOTIFICATION_FROM_EMAIL, appConfig.SUPPORT_NOTIFICATION_TO_EMAIL, emailContent.subject, emailContent.body)
    logger.info('SupportObserver: end to send email')

    return true
  }
}
