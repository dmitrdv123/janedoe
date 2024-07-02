import { NotificationDao } from '@repo/dao/dist/src/dao/notification.dao'
import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'

import { logger } from '../utils/logger'

export interface NotificationService {
  loadNotifications<T>(notificationType: NotificationType): Promise<Notification<T>[]>
  createNotification<T>(key: string, notificationType: NotificationType, timestamp: number, data: T): Promise<void>
  removeNotification<T>(notification: Notification<T>): Promise<void>
}

export class NotificationServiceImpl implements NotificationService {
  public constructor(
    private notificationDao: NotificationDao
  ) { }

  public async loadNotifications<T>(notificationType: NotificationType): Promise<Notification<T>[]> {
    logger.debug('NotificationService: start to load notifications')
    const notifications = await this.notificationDao.listNotifications<T>(notificationType)
    logger.debug(`NotificationService: end to load notifications. Found ${notifications.length} to load notifications`)
    logger.debug(notifications)

    return notifications
  }

  public async createNotification<T>(key: string, notificationType: NotificationType, timestamp: number, data: T): Promise<void> {
    logger.debug(`NotificationService: start to create notification for key ${key}, notification type ${notificationType} and timestamp ${timestamp}`)
    logger.debug(data)
    await this.notificationDao.saveNotification({ key, notificationType, timestamp, data })
    logger.debug('NotificationService: end to create notification')
  }

  public async removeNotification<T>(notification: Notification<T>): Promise<void> {
    logger.debug(`NotificationService: start to remove notification with key ${notification.key}, notification type ${notification.notificationType} and timestamp ${notification.timestamp}`)
    await this.notificationDao.deleteNotification(notification.key, notification.notificationType, notification.timestamp)
    logger.debug('NotificationService: end to remove notification')
  }
}
