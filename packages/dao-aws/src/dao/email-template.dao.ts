import { EmailTemplateDao } from '@repo/dao/dist/src/dao/email-template.dao'
import { PaymentNotificationEmailTemplate, SupportNotificationEmailTemplate } from '@repo/dao/dist/src/interfaces/notification-email-template'

import { S3Service } from '../services/s3.service'

export class EmailTemplateDaoImpl implements EmailTemplateDao {
  private static readonly BASE_PATH = 'email'
  private static readonly PAYMENT_PATH = 'payment'
  private static readonly SUPPORT_PATH = 'support'

  private static readonly PAYMENT_TITLE_FILE = 'title.txt'
  private static readonly PAYMENT_RECEIPT_FILE = 'receipt.html'
  private static readonly PAYMENT_RECEIPT_ITEM_FILE = 'receipt_item.html'

  private static readonly SUPPORT_TITLE_FILE = 'title.txt'
  private static readonly SUPPORT_CONTENT_FILE = 'content.html'

  public constructor(
    private s3Service: S3Service
  ) { }

  public async loadPaymentNotificationEmailTemplate(lang: string): Promise<PaymentNotificationEmailTemplate | undefined> {
    const [title, receipt, receiptItem] = await Promise.all([
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.PAYMENT_PATH, EmailTemplateDaoImpl.PAYMENT_TITLE_FILE].join('/')),
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.PAYMENT_PATH, EmailTemplateDaoImpl.PAYMENT_RECEIPT_FILE].join('/')),
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.PAYMENT_PATH, EmailTemplateDaoImpl.PAYMENT_RECEIPT_ITEM_FILE].join('/'))
    ])

    return title && receipt && receiptItem
      ? { title, receipt, receiptItem }
      : undefined
  }

  public async loadSupportNotificationEmailTemplate(lang: string): Promise<SupportNotificationEmailTemplate | undefined> {
    const [title, content] = await Promise.all([
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.SUPPORT_PATH, EmailTemplateDaoImpl.SUPPORT_TITLE_FILE].join('/')),
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.SUPPORT_PATH, EmailTemplateDaoImpl.SUPPORT_CONTENT_FILE].join('/')),
    ])

    return title && content
      ? { title, content }
      : undefined
  }
}
