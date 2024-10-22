import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'

import { SupportTicket } from '@repo/dao/dist/src/interfaces/support-ticket'
import { AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountTeamSettings, Permission } from '@repo/dao/dist/src/interfaces/account-settings'
import { PaymentFilter } from '@repo/dao/dist/src/interfaces/payment-filter'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'

import { assertMaxLength, assertNumberParam, assertObjectParam, assertParam, assertUrl, minifyToken, processControllerError, tryParseInt } from '../utils/utils'
import { AccountService } from '../services/account-service'
import { ExchangeRateApiService } from '../services/exchange-rate-api-service'
import { ADDRESS_MAX_LENGTH, BLOCKCHAIN_MAX_LENGTH, CALLBACK_URL_MAX_LENGTH, CURRENCY_MAX_LENGTH, DEFAULT_MAX_LENGTH, DESC_MAX_LENGTH, EMAIL_MAX_LENGTH, PAYMENT_ID_MAX_LENGTH, PERMISSION_PRIORITY, SECRET_KEY_MAX_LENGTH, TICKET_TYPE_MAX_LENGTH, TOKEN_MAX_LENGTH, TRANSACTION_MAX_LENGTH } from '../constants'
import { MetaService } from '../services/meta-service'
import { SupportService } from '../services/support-service'
import { PaymentLogKey } from '../interfaces/payment-log'
import { SettingsService } from '../services/settings-service'

export class AccountController {
  public constructor(
    private settingsService: SettingsService,
    private metaService: MetaService,
    private accountService: AccountService,
    private exchangeRateApiService: ExchangeRateApiService,
    private supportService: SupportService
  ) { }

  public ping(_req: Request, res: Response, _next: NextFunction) {
    res.send({})
  }

  public async appSettings(_req: Request, res: Response, _next: NextFunction) {
    try {
      const settings = await this.settingsService.loadAppSettings()
      res.send(settings)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async defaultAccountPaymentSettings(_req: Request, res: Response, _next: NextFunction) {
    try {
      const data = await this.accountService.loadDefaultAccountPaymentSettings()
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async accountSettings(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)

      const isOwner = req.headers['x-is-owner'] ? Boolean(req.headers['x-is-owner']) : false
      const ownerAddress = req.headers['x-owner-address'] as string
      const permissions: { [key: string]: Permission } = req.headers['x-permission'] ? JSON.parse(req.headers['x-permission'] as string) : {}

      const paymentPermission = permissions['payment_settings'] ?? 'Disable'
      const commonPermission = permissions['common_settings'] ?? 'Disable'
      const notificationPermission = permissions['notification_settings'] ?? 'Disable'
      const apiPermission = permissions['api_settings'] ?? 'Disable'
      const teamPermission = permissions['team_settings'] ?? 'Disable'

      const paymentPermissionPriority = PERMISSION_PRIORITY[paymentPermission]
      const commonPermissionPriority = PERMISSION_PRIORITY[commonPermission]
      const notificationPermissionPriority = PERMISSION_PRIORITY[notificationPermission]
      const apiPermissionPriority = PERMISSION_PRIORITY[apiPermission]
      const teamPermissionPriority = PERMISSION_PRIORITY[teamPermission]

      const requiredPermissionPriority = PERMISSION_PRIORITY['View']

      const settings = await this.accountService.loadAccountSettings(req.params.id)

      res.send({
        rbacSettings: { isOwner, ownerAddress, permissions },
        paymentSettings: isOwner || paymentPermissionPriority >= requiredPermissionPriority ? settings?.paymentSettings : undefined,
        commonSettings: isOwner || commonPermissionPriority >= requiredPermissionPriority ? settings?.commonSettings : undefined,
        notificationSettings: isOwner || notificationPermissionPriority >= requiredPermissionPriority ? settings?.notificationSettings : undefined,
        apiSettings: isOwner || apiPermissionPriority >= requiredPermissionPriority ? settings?.apiSettings : undefined,
        teamSettings: isOwner || teamPermissionPriority >= requiredPermissionPriority ? settings?.teamSettings : undefined
      })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async saveAccountPaymentSettings(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertObjectParam('payment settings', req.body)

      const settings: AccountPaymentSettings = req.body
      settings.blockchains.forEach(blockchain => assertParam('blockchain', blockchain, BLOCKCHAIN_MAX_LENGTH))
      settings.assets.forEach(asset => {
        assertParam('blockchain', asset.blockchain, BLOCKCHAIN_MAX_LENGTH)
        assertMaxLength('address', asset.address, ADDRESS_MAX_LENGTH)
        assertParam('address', asset.symbol, TOKEN_MAX_LENGTH)
      })

      await this.accountService.saveAccountPaymentSettings(req.params.id, settings)
      res.send({})
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async saveAccountCommonSettings(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertObjectParam('common settings', req.body)

      const settings: AccountCommonSettings = req.body
      assertMaxLength('currency', settings.currency, CURRENCY_MAX_LENGTH)
      assertMaxLength('description', settings.description, DESC_MAX_LENGTH)
      assertMaxLength('email', settings.email, EMAIL_MAX_LENGTH)

      await this.accountService.saveAccountCommonSettings(req.params.id, settings)
      res.send({})
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async saveAccountNotificationSettings(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertObjectParam('notification settings', req.body)

      const settings: AccountNotificationSettings = req.body
      assertMaxLength('callback url', settings.callbackUrl, CALLBACK_URL_MAX_LENGTH)
      assertMaxLength('secret key', settings.secretKey, SECRET_KEY_MAX_LENGTH)

      if (settings.callbackUrl) {
        assertUrl('callback url', settings.callbackUrl)
      }

      await this.accountService.saveAccountNotificationSettings(req.params.id, settings)
      res.send({})
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async createAccountApiKeySettings(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)

      const settings = await this.accountService.createAccountApiKeySettings(req.params.id)
      res.send(settings)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async removeAccountApiKeySettings(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)

      await this.accountService.removeAccountApiKeySettings(req.params.id)
      res.send({})
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async saveAccountTeamSettings(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertObjectParam('team settings', req.body)

      const settings: AccountTeamSettings = req.body
      settings.users.forEach(user => {
        assertParam('address', user.address, ADDRESS_MAX_LENGTH)
        assertParam('id', user.accountTeamUserSettingsId, DEFAULT_MAX_LENGTH)

        Object.entries(user.permissions).forEach(([key, value]) => {
          assertParam('permission key', key, DEFAULT_MAX_LENGTH)
          assertParam('permission value', value, DEFAULT_MAX_LENGTH)
        })
      })

      await this.accountService.saveAccountTeamSettings(
        req.params.id, req.headers['x-owner-address'] as string, settings
      )
      res.send({})
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async balance(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('blockchain', req.params.blockchain, BLOCKCHAIN_MAX_LENGTH)

      const balance = await this.accountService.balance(req.params.id, req.params.blockchain)
      res.send({ balance })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async withdraw(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('blockchain', req.params.blockchain, BLOCKCHAIN_MAX_LENGTH)

      const { address, amount } = req.body
      assertParam('address', address, ADDRESS_MAX_LENGTH)
      assertParam('amount', amount)

      const result = await this.accountService.withdraw(req.params.id, req.params.blockchain, address, amount)
      res.send(result)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async payments(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertObjectParam('filter', req.body.filter as PaymentFilter)

      const size = req.body.size as number
      const filter = req.body.filter as PaymentFilter
      const last: PaymentLogKey | undefined = req.body.last
        ? {
          accountId: req.params.id,
          paymentId: req.body.last.paymentId,
          blockchain: req.body.last.blockchain,
          transaction: req.body.last.transaction,
          index: req.body.last.index
        }
        : undefined

      const payments = await this.accountService.loadPaymentHistory(req.params.id, filter, last, size)
      res.send(payments)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async paymentsCsv(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertObjectParam('filter', req.body.filter as PaymentFilter)

      const filter = req.body.filter as PaymentFilter
      const payments = await this.accountService.loadPaymentHistoryDataAsCsv(req.params.id, filter)

      res.send(payments)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async paymentUpdates(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      const from = tryParseInt(req.params.from)
      assertNumberParam('from', from)

      const size = await this.accountService.checkPaymentHistoryUpdates(req.params.id, from as number)
      res.send({ size })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async meta(_req: Request, res: Response, _next: NextFunction) {
    try {
      const meta = await this.metaService.meta()
      res.send({
        blockchains: meta.blockchains,
        tokens: meta.tokens.map(minifyToken),
        swappers: meta.swappers
      })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async ipn(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('paymentId', req.params.paymentId, PAYMENT_ID_MAX_LENGTH)
      assertParam('blockchain', req.params.blockchain, BLOCKCHAIN_MAX_LENGTH)
      assertParam('transaction', req.params.transaction, TRANSACTION_MAX_LENGTH)
      const index = tryParseInt(req.params.index)
      assertNumberParam('index', index)

      const result = await this.accountService.loadIpn({
        accountId: req.params.id,
        paymentId: req.params.paymentId,
        blockchain: req.params.blockchain,
        transaction: req.params.transaction,
        index: index as number
      })
      res.send(result)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async sendIpn(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('paymentId', req.body.paymentId, PAYMENT_ID_MAX_LENGTH)
      assertParam('blockchain', req.body.blockchain, BLOCKCHAIN_MAX_LENGTH)
      assertParam('transaction', req.body.transaction, TRANSACTION_MAX_LENGTH)
      assertNumberParam('index', req.body.index)

      const result = await this.accountService.sendIpn({
        accountId: req.params.id,
        paymentId: req.body.paymentId,
        blockchain: req.body.blockchain,
        transaction: req.body.transaction,
        index: req.body.index
      })
      res.send(result)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async exchangeRates(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('currency', req.params.currency, CURRENCY_MAX_LENGTH)
      assertObjectParam('timestamps', req.body.timestamps)

      const exchangeRates = await this.exchangeRateApiService.exchangeRates(req.params.currency, req.body.timestamps)
      res.send({ exchangeRates })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async exchangeRate(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('currency', req.params.currency, CURRENCY_MAX_LENGTH)

      const exchangeRate = await this.exchangeRateApiService.exchangeRate(req.params.currency)
      if (!exchangeRate) {
        res.status(500).send({ message: 'Exchange rate is not found' })
        return
      }

      res.send({ exchangeRate })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async sharedAccounts(req: Request, res: Response, _next: NextFunction) {
    try {
      assertParam('address', req.auth?.address, ADDRESS_MAX_LENGTH)

      const accounts = await this.accountService.listSharedAccounts(req.auth?.address)
      res.send({ accounts })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async support(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('id', req.params.id, ACCOUNT_ID_LENGTH)
      assertParam('desc', req.body.desc, DESC_MAX_LENGTH)
      assertParam('email', req.body.email, EMAIL_MAX_LENGTH)
      assertParam('ticket Type', req.body.ticketType, TICKET_TYPE_MAX_LENGTH)
      assertMaxLength('payment id', req.body.paymentId, PAYMENT_ID_MAX_LENGTH)
      assertMaxLength('blockchain', req.body.blockchain, BLOCKCHAIN_MAX_LENGTH)
      assertMaxLength('from', req.body.from, ADDRESS_MAX_LENGTH)
      assertMaxLength('transaction', req.body.transaction, TRANSACTION_MAX_LENGTH)
      assertMaxLength('token', req.body.token, TOKEN_MAX_LENGTH)

      const ticket: SupportTicket = {
        ticketOrigin: 'account',
        ticketType: req.body.ticketType,
        email: req.body.email,
        from: req.body.from,
        companyId: req.params.id,
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

