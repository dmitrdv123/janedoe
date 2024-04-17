import { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'

import { Permission } from '@repo/dao/dist/src/interfaces/account-settings'

import container from '../containers/main.container'
import { logger } from '../utils/logger'
import { PERMISSION_PRIORITY } from '../constants'
import { AccountService } from '../services/account-service'
import { processControllerError } from '../utils/utils'

const accountService = container.resolve<AccountService>('accountService')

export function rbacMiddleware(key?: string, permission?: Permission) {
  return async (req: Request | undefined, res: Response, next: NextFunction) => {
    try {
      if (!req) {
        return next()
      }

      const id = req.params.id
      if (!id) {
        logger.debug('RbacMiddleware: Access not allowed. Id is not set')
        res.status(403).send({ error: { code: 403, message: 'Id is not set' } })
        return
      }

      const address = req.auth?.address
      if (!address) {
        logger.debug('RbacMiddleware: Access not allowed. Address is not set')
        res.status(403).send({ error: { code: 403, message: 'Address is not set' } })
        return
      }

      if (id === req.auth?.id) {
        req.headers['x-is-owner'] = 'true'
        req.headers['x-owner-address'] = address
        logger.debug(`RbacMiddleware: Access allowed. Address ${address} is the owner for account ${id}`)
        return next()
      }

      const sharedAccount = await accountService.loadSharedAccount(address, id)
      if (!sharedAccount) {
        logger.debug(`RbacService: Access not allowed. Account ${id} is not shared for address ${address}`)
        res.status(403).send({ error: { code: 403, message: 'Access forbidden' } })
        return
      }

      if (key && permission) {
        const userPermission = sharedAccount.permissions[key]
        const permissionPriority = PERMISSION_PRIORITY[permission]
        const userPermissionPriority = PERMISSION_PRIORITY[userPermission]

        if (userPermissionPriority < permissionPriority) {
          logger.debug(`RbacService: Access not allowed. Address ${address} does not have enough permission for ${key} to ${permission} for account ${id}`)
          res.status(403).send({ error: { code: 403, message: 'Access forbidden' } })
          return
        }
      }

      req.headers['x-owner-address'] = sharedAccount.sharedAddress
      req.headers['x-permission'] = JSON.stringify(sharedAccount.permissions)

      logger.debug('RbacMiddleware: Access allowed')

      next()
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
