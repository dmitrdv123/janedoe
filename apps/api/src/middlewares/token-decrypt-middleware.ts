import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'

import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import { CryptoService } from '@repo/common/dist/src/services/crypto-service'

import { processControllerError } from '../utils/utils'

const cryptoService = commonContainer.resolve<CryptoService>('cryptoService')

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
