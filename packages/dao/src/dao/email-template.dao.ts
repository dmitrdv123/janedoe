import { PaymentNotificationEmailTemplate } from '../interfaces/payment-notification-email-template'

export interface EmailTemplateDao {
  loadPaymentNotificationEmailTemplate(lang: string): Promise<PaymentNotificationEmailTemplate | undefined>
  savePaymentNotificationEmailTemplate(lang: string, template: PaymentNotificationEmailTemplate): Promise<void>
}
