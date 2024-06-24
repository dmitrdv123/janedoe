import { EmailTemplateDao } from '@repo/dao/dist/src/dao/email-template.dao'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

import appConfig from '@repo/common/dist/src/app-config'

import { DEFAULT_FIAT_DECIMAL_PLACES } from '../constants'
import { formatToFixed, roundNumber } from '../utils/utils'
import { Email } from '../interfaces/email'

export interface EmailTemplateService {
  paymentNotificationEmail(id: string, paymentId: string, currency: string, amountCurrency: number, language: string, description: string, paymentLogs: PaymentLog[]): Promise<Email>
}

export class EmailTemplateServiceImpl implements EmailTemplateService {
  public constructor(
    private emailTemplateDao: EmailTemplateDao
  ) { }

  public async paymentNotificationEmail(id: string, paymentId: string, currency: string, amountCurrency: number, language: string, description: string, paymentLogs: PaymentLog[]): Promise<Email> {
    let template = await this.emailTemplateDao.loadPaymentNotificationEmailTemplate(language)
    if (!template) {
      template = await this.emailTemplateDao.loadPaymentNotificationEmailTemplate('en')
    }
    if (!template) {
      throw new Error(`EmailTemplateService: cannot find payment notification email template for ${language} and default fallback language en`)
    }

    const { title: templateTitle, receipt: templateReceipt, receiptItem: templateReceiptItem  } = template

    const subject = templateTitle
      .replace('${id}', id)
      .replace('${payment_id}', paymentId)

    const receiptItems = paymentLogs.map(payment => {
      const dt = new Date(1000 * payment.timestamp)

      const amountFormatted = payment.tokenDecimals
        ? formatToFixed(BigInt(payment.amount), payment.tokenDecimals)
        : payment.amount

      return templateReceiptItem
        .replaceAll('${dt}', dt.toISOString().replace('T', ' ').replace(/\..+/, ''))
        .replaceAll('${blockchain}', payment.blockchain)
        .replaceAll('${amount}', `${amountFormatted} ${payment.tokenSymbol ?? payment.tokenAddress ?? ''}`)
    })

    const body = templateReceipt
      .replaceAll('${app_name}', appConfig.APP_NAME)
      .replaceAll('${app_url}', appConfig.APP_URL)
      .replaceAll('${status_page_url}', `${appConfig.PAYMENT_URL}/status/${id}/${paymentId}/${currency}/${amountCurrency}`)
      .replaceAll('${id}', id)
      .replaceAll('${description}', description)
      .replaceAll('${payment_id}', paymentId)
      .replaceAll('${receipt_items}', receiptItems.join())
      .replaceAll('${amount_currency}', `${roundNumber(amountCurrency, DEFAULT_FIAT_DECIMAL_PLACES)} ${currency.toLocaleUpperCase()}`)
      .replaceAll('${support_url}', appConfig.SUPPORT_URL)

    return { subject, body }
  }
}
