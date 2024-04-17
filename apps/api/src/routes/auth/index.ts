import express, { Router } from 'express'

import container from '../../containers/main.container'
import { AuthController } from '../../controllers/auth-controller'

export const authRouter: Router = express.Router()
const controller = container.resolve<AuthController>('authController')

/** /api/auth */
authRouter.route('/nonce').post(controller.createNonce.bind(controller))
authRouter.route('/:nonceId').post(controller.auth.bind(controller))
