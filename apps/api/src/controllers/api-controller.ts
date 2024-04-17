import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'

import { assertParam, processControllerError } from '../utils/utils'
import { ApiService } from '../services/api-service'

export class ApiController {
  public constructor(
    private apiService: ApiService
  ) { }

  public async payments(req: Request, res: Response, _next: NextFunction) {
    try {
      const id = req.headers['x-api-id'] as string
      const from: string | undefined = req.query.from as string | undefined
      const to: string | undefined = req.query.to as string | undefined

      assertParam('id', id)

      const payments = await this.apiService.loadPaymentHistory(id, from ? Number(from) : undefined, to ? Number(to) : undefined)
      res.send({ payments })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async blockchains(_req: Request, res: Response, _next: NextFunction) {
    try {
      const blockchains = await this.apiService.loadBlockchains()
      res.send({ blockchains })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async tokens(_req: Request, res: Response, _next: NextFunction) {
    try {
      const tokens = await this.apiService.loadTokens()
      res.send({ tokens })
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
