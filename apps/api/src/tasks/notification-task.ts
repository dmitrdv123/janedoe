import { Notification } from '@repo/dao/dist/src/interfaces/notification'

import { MAX_NOTIFICATION_TIMESTAMP_DELTA_SEC } from '../constants'
import { NotificationService } from '../services/notification-service'
import { NotificationObserver } from '../services/notifications/notification-observer'
import { logger } from '../utils/logger'
import { Task } from './task-manager'

export class NotificationTask implements Task {
  public constructor(
    private observers: { [key: string]: NotificationObserver },
    private notificationService: NotificationService,
    private interval: number
  ) { }

  public getInterval(): number {
    return this.interval
  }

  public async run(): Promise<void> {
    try {
      logger.info(`NotificationTask: payment task start`)

      logger.debug(`NotificationTask: start to find notifications`)
      const notifications = await this.notificationService.loadNotifications()
      logger.debug(`NotificationTask: found ${notifications.length} notifications`)

      await Promise.all(
        notifications.map(async notification => {
          try {
            await this.process(notification)
          } catch (error) {
            logger.error(`NotificationTask: error happens`)
            logger.error(error)
          }
        })
      )
    } catch (error) {
      logger.error(`NotificationTask: error happens`)
      logger.error(error)
    }
  }

  private async process<T>(notification: Notification<T>): Promise<void> {
    logger.debug(`NotificationTask: start process notification ${notification.key}`)
    logger.debug(notification)

    let processed = false
    const observer = this.observers[notification.notificationType]
    if (observer) {
      logger.debug(`NotificationTask: start to notify observer about notification ${notification.key}`)
      processed = await observer.notify(notification)
    } else {
      logger.debug(`NotificationTask: observer not found for notification ${notification.notificationType}`)
    }

    if (processed) {
      logger.debug(`NotificationTask: start to remove notification ${notification.key}`)
      await this.notificationService.removeNotification(notification)
      logger.debug('NotificationTask: end to remove notification')
    } else if (Date.now() - notification.timestamp >= MAX_NOTIFICATION_TIMESTAMP_DELTA_SEC) {
      logger.debug(`NotificationTask: start to remove notification  ${notification.key} since it is older than limit`)
      await this.notificationService.removeNotification(notification)
      logger.debug('NotificationTask: end to remove notification')
    } else {
      logger.debug(`NotificationTask: notification ${notification.key} was not processed`)
    }
  }
}
