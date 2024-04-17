import { NextFunction, Request, Response } from 'express'

import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'

import { processControllerError } from '../utils/utils'

const cacheService = commonContainer.resolve<CacheService>('cacheService')

export function cacheMiddleware(ttl: number) {
  return (req: Request | undefined, res: Response, next: NextFunction) => {
    try {
      if (!req) {
        return next()
      }

      const key = `${req.method}#${req.originalUrl || req.url}#${req.body ? JSON.stringify(req.body) : ''}`
      const cacheContent = cacheService.get(key)

      if (cacheContent) {
        res.send(cacheContent)
      } else {
        const sendResponse = res.send.bind(res)
        res.send = body => {
          // Check if the response is an error before caching
          if (!res.statusCode || (res.statusCode >= 200 && res.statusCode < 400)) {
            cacheService.set(key, body, ttl)
          }
          return sendResponse(body)
        }
        next()
      }
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
