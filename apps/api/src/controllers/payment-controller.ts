import { NextFunction, Request, Response } from 'express'

import { SupportTicket } from '@repo/dao/dist/src/interfaces/support-ticket'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'

import { assertMaxLength, assertNumberParam, assertObjectParam, assertParam, minifyToken, paramsFromUrl, processControllerError, tryParseFloat } from '../utils/utils'
import { RangoWrapperService } from '../services/rango-wrapper-service'
import { PaymentService } from '../services/payment-service'
import { ExchangeRateApiService } from '../services/exchange-rate-api-service'
import { MetaService } from '../services/meta-service'
import { SupportService } from '../services/support-service'
import { ADDRESS_MAX_LENGTH, BLOCKCHAIN_MAX_LENGTH, CURRENCY_MAX_LENGTH, DESC_MAX_LENGTH, EMAIL_MAX_LENGTH, LANGUAGE_MAX_LENGTH, PAYMENT_ID_MAX_LENGTH, TICKET_TYPE_MAX_LENGTH, TOKEN_MAX_LENGTH, TRANSACTION_MAX_LENGTH } from '../constants'
import { SettingsService } from '../services/settings-service'

export class PaymentController {
  public constructor(
    private settingsService: SettingsService,
    private metaService: MetaService,
    private paymentService: PaymentService,
    private rangoWrapperService: RangoWrapperService,
    private exchangeRateApiService: ExchangeRateApiService,
    private supportService: SupportService
  ) { }

  public async quote(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.rangoWrapperService.quote(paramsFromUrl(req.url))
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async swap(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.rangoWrapperService.swap(paramsFromUrl(req.url))
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async isApproved(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.rangoWrapperService.isApproved(paramsFromUrl(req.url))
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async status(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.rangoWrapperService.status(paramsFromUrl(req.url))
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async settings(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('payment id', req.params.paymentId, PAYMENT_ID_MAX_LENGTH)
      assertParam('currency', req.params.currency, CURRENCY_MAX_LENGTH)

      const [appSettings, paymentSettings, meta, exchangeRate] = await Promise.all([
        this.settingsService.loadAppSettings(),
        this.paymentService.paymentSettings(req.params.id, req.params.paymentId),
        this.metaService.meta(),
        this.exchangeRateApiService.exchangeRate(req.params.currency)
      ])

      if (!exchangeRate) {
        next('Exchange rate is not found')
        return
      }

      res.send({
        appSettings,
        paymentSettings,
        exchangeRate,
        meta: {
          blockchains: meta.blockchains,
          tokens: meta.tokens.map(minifyToken),
          swappers: meta.swappers
        }
      })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async payments(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('payment id', req.params.paymentId, PAYMENT_ID_MAX_LENGTH)

      const data = await this.paymentService.loadPaymentHistory(req.params.id, req.params.paymentId)
      res.send({ data })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async exchangeRates(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('currency', req.params.currency, CURRENCY_MAX_LENGTH)
      assertObjectParam('timestamps', req.body.timestamps)

      const exchangeRates = await this.exchangeRateApiService.exchangeRates(req.params.currency, req.body.timestamps)
      res.send({ exchangeRates })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async received(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('payment id', req.params.paymentId, PAYMENT_ID_MAX_LENGTH)
      assertParam('blockchain', req.params.blockchain, BLOCKCHAIN_MAX_LENGTH)

      const received = await this.paymentService.received(req.params.id, req.params.paymentId, req.params.blockchain)
      res.send({ received })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async balance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.rangoWrapperService.balance(paramsFromUrl(req.url))
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async success(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.blockchain && req.body.email) {
        assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
        assertParam('payment id', req.params.paymentId, PAYMENT_ID_MAX_LENGTH)
        assertParam('currency', req.params.currency, CURRENCY_MAX_LENGTH)
        assertParam('language', req.params.language, LANGUAGE_MAX_LENGTH)
        assertParam('blockchain', req.body.blockchain, BLOCKCHAIN_MAX_LENGTH)
        assertParam('email', req.body.email, EMAIL_MAX_LENGTH)

        const amountCurrency = tryParseFloat(req.params.amountCurrency)
        assertNumberParam('amount currency', amountCurrency)

        await this.paymentService.saveSuccess(req.params.id, req.params.paymentId, req.params.currency, amountCurrency as number, req.body.blockchain, req.body.email, req.params.language)
      }

      res.send({})
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async support(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('email', req.body.email, EMAIL_MAX_LENGTH)
      assertParam('desc', req.body.desc, DESC_MAX_LENGTH)
      assertParam('ticket Type', req.body.ticketType, TICKET_TYPE_MAX_LENGTH)
      assertMaxLength('company id', req.body.companyId, ACCOUNT_ID_LENGTH)
      assertMaxLength('payment id', req.body.paymentId, PAYMENT_ID_MAX_LENGTH)
      assertMaxLength('blockchain', req.body.blockchain, BLOCKCHAIN_MAX_LENGTH)
      assertMaxLength('to', req.body.to, ADDRESS_MAX_LENGTH)
      assertMaxLength('transaction', req.body.transaction, TRANSACTION_MAX_LENGTH)
      assertMaxLength('token', req.body.token, TOKEN_MAX_LENGTH)

      const ticket: SupportTicket = {
        ticketOrigin: 'payment',
        ticketType: req.body.ticketType,
        email: req.body.email,
        from: req.body.from,
        companyId: req.body.companyId,
        paymentId: req.body.paymentId,
        blockchain: req.body.blockchain,
        token: req.body.token,
        transaction: req.body.transaction,
        desc: req.body.desc
      }

      const ticketId = await this.supportService.createTicket(ticket)
      res.send({ ticketId })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
