import express, { Router } from 'express'

import container from '../../containers/main.container'
import { DEFAULT_BLOG_CACHING_SECONDS } from '../../constants'
import { cacheMiddleware } from '../../middlewares/cache-middleware'
import { LandingController } from '../../controllers/landing-controller'

export const landingRouter: Router = express.Router()
const controller = container.resolve<LandingController>('landingController')

/** /api/landing */
landingRouter.route('/article/latest').get(
  cacheMiddleware(DEFAULT_BLOG_CACHING_SECONDS), controller.latestArticle.bind(controller)
)
landingRouter.route('/articles/:timestamp?').get(
  cacheMiddleware(DEFAULT_BLOG_CACHING_SECONDS), controller.articles.bind(controller)
)
