import { Notification } from '@repo/dao/dist/src/interfaces/notification'

export interface NotificationObserver {
  notify<T>(notification: Notification<T>): Promise<boolean>
}
