import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'

import container from '../containers/main.container'
import { processControllerError } from '../utils/utils'
import { CryptoService } from '../services/crypto-service'

const cryptoService = container.resolve<CryptoService>('cryptoService')

export function jwtDecryptMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.data) {
        // Decrypt the payload
        const decryptedPayload = cryptoService.decrypt(req.auth?.data)

        // Parse and attach decrypted payload to req.auth
        req.auth = JSON.parse(decryptedPayload)
      }

      next()
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
