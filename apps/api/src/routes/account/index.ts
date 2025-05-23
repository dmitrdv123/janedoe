import { Router } from 'express'
import { Request, UnauthorizedError, expressjwt } from 'express-jwt'
import { Jwt, JwtPayload } from 'jsonwebtoken'

import { CryptoService } from '@repo/common/dist/src/services/crypto-service'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'

import { DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS, JWT_ALGORITHM } from '../../constants'
import { AccountController } from '../../controllers/account-controller'
import container from '../../containers/main.container'
import { cacheMiddleware } from '../../middlewares/cache-middleware'
import { AccountService } from '../../services/account-service'
import { rbacMiddleware } from '../../middlewares/rbac-middleware'
import { jwtDecryptMiddleware } from '../../middlewares/token-decrypt-middleware'

export const accountRouter: Router = Router()
const controller = container.resolve<AccountController>('accountController')
const accountService = container.resolve<AccountService>('accountService')
const cryptoService = commonContainer.resolve<CryptoService>('cryptoService')

const jwtConfig = {
  algorithms: [JWT_ALGORITHM],
  secret: async (_: Request, token: Jwt | undefined) => {
    if (!token) {
      throw new UnauthorizedError('credentials_required', new Error('Token is missing'))
    }

    const payload = JSON.parse(
      cryptoService.decrypt((token.payload as JwtPayload).data)
    )
    if (!payload.id) {
      throw new UnauthorizedError('credentials_bad_format', new Error('Id is missing in token payload'))
    }

    const accountProfile = await accountService.loadAccountProfile(payload.id)
    if (!accountProfile) {
      throw new UnauthorizedError('invalid_token', new Error(`Account profile ${payload.id} not found`))
    }

    return accountProfile.secret
  }
}

/** /api/account */
accountRouter.route('/ping/:id').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware(),
  controller.ping.bind(controller)
)
accountRouter.route('/balance/:id/:blockchain').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('balances', 'View'),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.balance.bind(controller)
)
accountRouter.route('/withdraw/:id/:blockchain/:address').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('balances', 'Modify'),
  controller.withdraw.bind(controller)
)
accountRouter.route('/refund/:id/:paymentId/:blockchain/:transaction/:index').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('balances', 'Modify'),
  controller.refund.bind(controller)
)
accountRouter.route('/ipn/:id/:paymentId/:blockchain/:transaction/:index').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('payments', 'View'),
  controller.ipn.bind(controller)
)
accountRouter.route('/ipn/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('payments', 'Modify'),
  controller.sendIpn.bind(controller)
)
accountRouter.route('/shared').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.sharedAccounts.bind(controller)
)

accountRouter.route('/meta').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.meta.bind(controller)
)

accountRouter.route('/settings').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.appSettings.bind(controller)
)
accountRouter.route('/settings/:id').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware(),
  controller.accountSettings.bind(controller)
)
accountRouter.route('/settings/payment/default').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.defaultAccountPaymentSettings.bind(controller)
)
accountRouter.route('/settings/payment/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('payment_settings', 'Modify'),
  controller.saveAccountPaymentSettings.bind(controller)
)
accountRouter.route('/settings/common/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('common_settings', 'Modify'),
  controller.saveAccountCommonSettings.bind(controller)
)
accountRouter.route('/settings/notification/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('notification_settings', 'Modify'),
  controller.saveAccountNotificationSettings.bind(controller)
)
accountRouter.route('/settings/api/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('api_settings', 'Modify'),
  controller.createAccountApiKeySettings.bind(controller)
)
accountRouter.route('/settings/api/:id').delete(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('api_settings', 'Modify'),
  controller.removeAccountApiKeySettings.bind(controller)
)
accountRouter.route('/settings/team/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('team_settings', 'Modify'),
  controller.saveAccountTeamSettings.bind(controller)
)

accountRouter.route('/payments/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('payments', 'View'),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.payments.bind(controller)
)
accountRouter.route('/payments/csv/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('payments', 'View'),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.paymentsCsv.bind(controller)
)
accountRouter.route('/payments/updates/:id/:from').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware('payments', 'View'),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.paymentUpdates.bind(controller)
)

accountRouter.route('/exchange/:currency').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.exchangeRates.bind(controller)
)
accountRouter.route('/exchange/:currency').get(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_PAYMENT_CACHING_SECONDS),
  controller.exchangeRate.bind(controller)
)

accountRouter.route('/support/:id').post(
  expressjwt(jwtConfig),
  jwtDecryptMiddleware(),
  rbacMiddleware(),
  controller.support.bind(controller)
)
