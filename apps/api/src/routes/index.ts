import express, { Router } from 'express'

import { accountRouter } from './account'
import { authRouter } from './auth'
import { paymentRouter } from './payment'
import { sandboxRouter } from './sandbox'
import { apiRouter } from './api'
import { docRouter } from './doc'

export const routes: Router = express.Router()

routes.use('/account', accountRouter)
routes.use('/auth', authRouter)
routes.use('/payment', paymentRouter)
routes.use('/doc', docRouter)
routes.use('/sandboxy155nmejtmw', sandboxRouter)

routes.use('/v1', apiRouter)
