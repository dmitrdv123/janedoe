import { NextFunction, Request, Response } from 'express'

import { processControllerError, saveFile } from '../utils/utils'
import container from '../containers/main.container'
import { MetaService } from '../services/meta-service'
import { logger } from '../utils/logger'

export class SandboxController {
  public async callback(req: Request, res: Response, next: NextFunction) {
    try {
      saveFile('data/sandbox', `${Date.now()}.json`, JSON.stringify({
        body: req.body,
        headers: req.headers
      }))

      const randomBool = Math.random() < 0.5;
      if (randomBool) {
        next(new Error('some error'))
        return
      }

      res.send({ success: true })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async metaByTimestamp(req: Request, res: Response, next: NextFunction) {
    try {
      const metaService = container.resolve<MetaService>('metaService')
      const meta = await metaService.meta()
      res.send({ meta })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async test(req: Request, res: Response, next: NextFunction) {
    try {
      res.send({ })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async notify(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Notify: receiving request`)
      logger.info(req)
      logger.info(req.body)

      res.send({ })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
