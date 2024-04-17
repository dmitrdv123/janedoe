import { NotificationDao } from '@repo/dao/src/dao/notification.dao'
import { Notification, NotificationType } from '@repo/dao/src/interfaces/notification'

import { NotificationModel } from '../models/notification.model'

export class NotificationDaoImpl implements NotificationDao {
  public async listNotifications<T>(): Promise<Notification<T>[]> {
    const results = await NotificationModel.find().sort({ timestamp: 'asc' })
    const notifications = results.map(result => ({
      key: result.key,
      notificationType: result.notificationType as NotificationType,
      timestamp: result.timestamp,
      data: result.data as T
    }))

    return notifications
  }

  public async saveNotification<T>(notification: Notification<T>): Promise<void> {
    await NotificationModel.create({
      _id: [notification.notificationType, notification.key.toLocaleLowerCase(), notification.timestamp].join(':'),
      key: notification.key,
      notificationType: notification.notificationType,
      timestamp: notification.timestamp,
      data: notification.data
    })
  }

  public async deleteNotification(key: string, notificationType: NotificationType, timestamp: number): Promise<void> {
    await NotificationModel.deleteOne({ _id: [notificationType, key.toLocaleLowerCase(), timestamp].join(':') })
  }
}
