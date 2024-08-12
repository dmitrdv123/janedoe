import { PaymentNotificationEmailTemplate, SupportNotificationEmailTemplate } from '../interfaces/notification-email-template'

export interface EmailTemplateDao {
  loadPaymentNotificationEmailTemplate(lang: string): Promise<PaymentNotificationEmailTemplate | undefined>
  loadSupportNotificationEmailTemplate(lang: string): Promise<SupportNotificationEmailTemplate | undefined>
}
