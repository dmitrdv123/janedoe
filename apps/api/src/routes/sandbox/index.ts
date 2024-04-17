import express, { Router } from 'express'

import container from '../../containers/main.container'
import { SandboxController } from '../../controllers/sandbox-controller'

export const sandboxRouter: Router = express.Router()
const controller = container.resolve<SandboxController>('sandboxController')

/** /api/sandboxy155nmejtmw */
sandboxRouter.route('/callback').post(controller.callback.bind(controller))
sandboxRouter.route('/meta/:timestamp').get(controller.metaByTimestamp.bind(controller))
sandboxRouter.route('/test').get(controller.test.bind(controller))
