import { NextFunction, Request, Response } from 'express'

import { assertParam, processControllerError } from '../utils/utils'
import { AuthService } from '../services/auth-service'
import { ADDRESS_MAX_LENGTH } from '../constants'

export class AuthController {
  public constructor(private authService: AuthService) { }

  public async createNonce(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('wallet', req.body.wallet, ADDRESS_MAX_LENGTH)

      const result = await this.authService.createNonce(req.body.wallet)
      res.send(result)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async auth(req: Request, res: Response, next: NextFunction) {
    try {
      assertParam('nonce id', req.params.nonceId)
      assertParam('wallet', req.body.wallet, ADDRESS_MAX_LENGTH)
      assertParam('signature', req.body.signature)

      const result = await this.authService.auth(req.params.nonceId, req.body.wallet, req.body.signature)
      res.send(result)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}