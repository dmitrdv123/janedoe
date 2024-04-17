import express, { Router } from 'express'

import container from '../../containers/main.container'
import { ApiController } from '../../controllers/api-controller'
import { DEFAULT_ROUTE_API_CACHING_SECONDS } from '../../constants'
import { cacheMiddleware } from '../../middlewares/cache-middleware'
import { apiMiddleware } from '../../middlewares/api-middleware'

export const apiRouter: Router = express.Router()
const controller = container.resolve<ApiController>('apiController')

/** /api/v1 */
apiRouter.route('/payments').get(apiMiddleware(), cacheMiddleware(DEFAULT_ROUTE_API_CACHING_SECONDS), controller.payments.bind(controller))
apiRouter.route('/blockchains').get(apiMiddleware(), cacheMiddleware(DEFAULT_ROUTE_API_CACHING_SECONDS), controller.blockchains.bind(controller))
apiRouter.route('/tokens').get(apiMiddleware(), cacheMiddleware(DEFAULT_ROUTE_API_CACHING_SECONDS), controller.tokens.bind(controller))
