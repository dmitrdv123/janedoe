import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'

import { minifyToken, processControllerError } from '../utils/utils'
import { MetaService } from '../services/meta-service'
import { SettingsService } from '../services/settings-service'

export class DocController {
  public constructor(
    private settingsService: SettingsService,
    private metaService: MetaService
  ) { }

  public async appSettings(_req: Request, res: Response, _next: NextFunction) {
    try {
      const settings = await this.settingsService.loadAppSettings()
      res.send(settings)
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
}
