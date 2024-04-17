export enum NotificationType {
  PAYMENT = 'payment',
  IPN = 'ipn'
}

export interface Notification<T> {
  key: string
  notificationType: NotificationType
  timestamp: number
  data: T
}
