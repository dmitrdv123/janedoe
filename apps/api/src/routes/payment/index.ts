import express, { Router } from 'express'

import container from '../../containers/main.container'
import { PaymentController } from '../../controllers/payment-controller'
import { DEFAULT_ROUTE_PAYMENT_CACHING_SECONDS } from '../../constants'
import { cacheMiddleware } from '../../middlewares/cache-middleware'

export const paymentRouter: Router = express.Router()
const controller = container.resolve<PaymentController>('paymentController')

/** /api/payment */
paymentRouter.route('/zap/quote').get(controller.quote.bind(controller))
paymentRouter.route('/zap/swap').get(controller.swap.bind(controller))
paymentRouter.route('/zap/is-approved').get(controller.isApproved.bind(controller))
paymentRouter.route('/zap/status').get(controller.status.bind(controller))

paymentRouter.route('/success/:id/:paymentId/:currency/:amountCurrency/:language').post(controller.success.bind(controller))

paymentRouter.route('/balance').get(
  cacheMiddleware(DEFAULT_ROUTE_PAYMENT_CACHING_SECONDS), controller.balance.bind(controller)
)
paymentRouter.route('/settings/:id/:paymentId/:currency').get(
  cacheMiddleware(DEFAULT_ROUTE_PAYMENT_CACHING_SECONDS), controller.settings.bind(controller)
)
paymentRouter.route('/history/:id/:paymentId').get(
  cacheMiddleware(DEFAULT_ROUTE_PAYMENT_CACHING_SECONDS), controller.payments.bind(controller)
)
paymentRouter.route('/exchange/:currency').post(
  cacheMiddleware(DEFAULT_ROUTE_PAYMENT_CACHING_SECONDS), controller.exchangeRates.bind(controller)
)
paymentRouter.route('/support').post(
  cacheMiddleware(DEFAULT_ROUTE_PAYMENT_CACHING_SECONDS), controller.support.bind(controller)
)
