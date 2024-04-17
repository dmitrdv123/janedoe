import { NextFunction, Response, Request } from 'express'

import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'

import container from '../containers/main.container'
import { API_MAX_CALLS_PER_THROTTLING_INTERVAL_SECONDS, API_THROTTLING_INTERVAL_SECONDS } from '../constants'
import { AccountService } from '../services/account-service'
import { processControllerError } from '../utils/utils'

const accountService = container.resolve<AccountService>('accountService')
const cacheService = commonContainer.resolve<CacheService>('cacheService')

export function apiMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.header("x-api-key")
      if (!apiKey) {
        res.status(403).send({ error: { code: 403, message: 'API key is not set' } })
        return
      }

      const accountProfile = await accountService.loadAccountProfileByApiKey(apiKey)
      if (!accountProfile) {
        res.status(403).send({ error: { code: 403, message: 'API key is not correct' } })
        return
      }

      const count: number = cacheService.get(apiKey) ?? 0
      if (count >= API_MAX_CALLS_PER_THROTTLING_INTERVAL_SECONDS) {
        res.status(429).send({ error: { code: 429, message: 'Max API calls exceeded' } })
        return
      }

      cacheService.set(apiKey, count + 1, API_THROTTLING_INTERVAL_SECONDS)

      req.headers['x-api-id'] = accountProfile.id
      req.headers['x-api-address'] = accountProfile.address

      next()
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
