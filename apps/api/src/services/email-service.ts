import nodemailer from 'nodemailer'
import appConfig from '@repo/common/dist/src/app-config'
import { logger } from '../utils/logger'

export interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>
}

export class EmailServiceImpl implements EmailService {
  public async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const transport = JSON.parse(appConfig.EMAIL_CONFIG)
    const transporter = nodemailer.createTransport(transport)

    const mailOptions = {
      to,
      subject,
      html,
      from: appConfig.PAYMENT_NOTIFICATION_FROM_EMAIL
    }

    logger.debug('EmailService: mail option created')
    logger.debug(mailOptions)

    logger.debug('EmailService: start to send email')
    const result = await transporter.sendMail(mailOptions)
    logger.debug('EmailService: end to send mail')
    logger.debug(result)

    if (result.accepted.length === 0 || !result.response.startsWith('250')) {
      throw new Error(`EmailService: email was not sent to ${to} with subject ${subject}`)
    }
  }
}

