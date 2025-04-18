import { Notification, NotificationType } from '../interfaces/notification'

export interface NotificationDao {
  listNotifications<T>(notificationType: NotificationType): Promise<Notification<T>[]>
  saveNotification<T>(notification: Notification<T>): Promise<void>
  deleteNotification<T>(key: string, notificationType: NotificationType, timestamp: number): Promise<void>
}
