export enum NotificationType {
  PAYMENT = 'payment',
  IPN = 'ipn',
  SUPPORT = 'support'
}

export interface Notification<T> {
  key: string
  notificationType: NotificationType
  timestamp: number
  data: T
}
