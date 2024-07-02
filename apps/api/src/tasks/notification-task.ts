import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'

import { MAX_NOTIFICATION_TIMESTAMP_DELTA_SEC } from '../constants'
import { NotificationService } from '../services/notification-service'
import { NotificationObserver } from '../services/notifications/notification-observer'
import { logger } from '../utils/logger'
import { Task } from './task-manager'

export class NotificationTask<T> implements Task {
  public constructor(
    private notificationType: NotificationType,
    private observer: NotificationObserver,
    private notificationService: NotificationService
  ) { }

  public async run(): Promise<void> {
    try {
      logger.info(`NotificationTask ${this.notificationType}: notification task start`)

      logger.debug(`NotificationTask ${this.notificationType}: start to find notifications`)
      const notifications = await this.notificationService.loadNotifications<T>(this.notificationType)
      logger.debug(`NotificationTask ${this.notificationType}: found ${notifications.length} notifications`)

      await Promise.all(
        notifications.map(async notification => {
          try {
            await this.process(notification)
          } catch (error) {
            logger.error(`NotificationTask ${this.notificationType}: error happens`)
            logger.error(error)
          }
        })
      )
    } catch (error) {
      logger.error(`NotificationTask ${this.notificationType}: error happens`)
      logger.error(error)
    }
  }

  private async process(notification: Notification<T>): Promise<void> {
    logger.debug(`NotificationTask ${this.notificationType}: start process notification ${notification.key}`)
    logger.debug(notification)

    logger.debug(`NotificationTask ${this.notificationType}: start to notify observer about notification ${notification.key}`)
    const processed = await this.observer.notify(notification)
    logger.debug('NotificationTask ${this.notificationType}: end to notify observer')

    if (processed) {
      logger.debug(`NotificationTask ${this.notificationType}: start to remove notification ${notification.key}`)
      await this.notificationService.removeNotification(notification)
      logger.debug(`NotificationTask ${this.notificationType}: end to remove notification`)
    } else if (Date.now() - notification.timestamp >= MAX_NOTIFICATION_TIMESTAMP_DELTA_SEC) {
      logger.debug(`NotificationTask ${this.notificationType}: start to remove notification  ${notification.key} since it is older than limit`)
      await this.notificationService.removeNotification(notification)
      logger.debug('NotificationTask ${this.notificationType}: end to remove notification')
    } else {
      logger.debug(`NotificationTask ${this.notificationType}: notification ${notification.key} was not processed`)
    }
  }
}
