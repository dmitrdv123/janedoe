import path from 'path'

import { EmailTemplateDao } from '@repo/dao/dist/src/dao/email-template.dao'
import { PaymentNotificationEmailTemplate } from '@repo/dao/dist/src/interfaces/payment-notification-email-template'

import { S3Service } from '../services/s3.service'

export class EmailTemplateDaoImpl implements EmailTemplateDao {
  private static readonly BASE_PATH = 'email'
  private static readonly TITLE_FILE = 'title.txt'
  private static readonly RECEIPT_FILE = 'receipt.html'
  private static readonly RECEIPT_ITEM_FILE = 'receipt_item.html'

  public constructor(
    private s3Service: S3Service
  ) { }

  public async loadPaymentNotificationEmailTemplate(lang: string): Promise<PaymentNotificationEmailTemplate | undefined> {
    const [title, receipt, receiptItem] = await Promise.all([
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.TITLE_FILE].join('/')),
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.RECEIPT_FILE].join('/')),
      this.s3Service.loadFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.RECEIPT_ITEM_FILE].join('/'))
    ])

    return title && receipt && receiptItem
      ? {
        title,
        receipt,
        receiptItem,
      }
      : undefined
  }
  public async savePaymentNotificationEmailTemplate(lang: string, template: PaymentNotificationEmailTemplate): Promise<void> {
    await Promise.all([
      this.s3Service.saveFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.TITLE_FILE].join('/'), template.title),
      this.s3Service.saveFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.RECEIPT_FILE].join('/'), template.receipt),
      this.s3Service.saveFile([EmailTemplateDaoImpl.BASE_PATH, lang, EmailTemplateDaoImpl.RECEIPT_ITEM_FILE].join('/'), template.receiptItem)
    ])
  }
}
