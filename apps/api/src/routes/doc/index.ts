import { Router } from 'express'

import { DEFAULT_ROUTE_ACCOUNT_DOC_CACHING_SECONDS } from '../../constants'
import container from '../../containers/main.container'
import { cacheMiddleware } from '../../middlewares/cache-middleware'
import { DocController } from '../../controllers/doc-controller'

export const docRouter: Router = Router()
const controller = container.resolve<DocController>('docController')

/** /api/doc */
docRouter.route('/meta').get(
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_DOC_CACHING_SECONDS),
  controller.meta.bind(controller)
)

docRouter.route('/settings').get(
  cacheMiddleware(DEFAULT_ROUTE_ACCOUNT_DOC_CACHING_SECONDS),
  controller.appSettings.bind(controller)
)
