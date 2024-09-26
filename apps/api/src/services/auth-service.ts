import * as sigUtil from '@metamask/eth-sig-util'
import * as ethUtil from 'ethereumjs-util'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'

import { AuthDao } from '@repo/dao/dist/src/dao/auth.dao'
import { Nonce } from '@repo/dao/dist/src/interfaces/nonce'

import { JWT_ALGORITHM, JWT_EXPIRES } from '../constants'
import { Auth } from '../interfaces/auth'
import { AccountService } from './account-service'
import { logger } from '../utils/logger'
import { CryptoService } from './crypto-service'

export interface AuthService {
  createNonce(wallet: string): Promise<Nonce>
  auth(nonceId: string, wallet: string, signature: string): Promise<Auth>
}

export class AuthServiceImpl implements AuthService {
  public constructor(
    private accountService: AccountService,
    private cryptoService: CryptoService,
    private authDao: AuthDao
  ) { }

  public async createNonce(wallet: string): Promise<Nonce> {
    logger.debug('AuthService: start to create nonce')
    const nonce = crypto.randomUUID()
    const nonceId = crypto.randomUUID()

    await this.authDao.saveNonce({
      nonce,
      nonceId,
      wallet
    })

    const result = { nonce, nonceId, wallet }
    logger.debug('AuthService: end to create nonce')
    logger.debug(result)

    return result
  }

  public async auth(nonceId: string, wallet: string, signature: string): Promise<Auth> {
    logger.debug(`AuthService: start to load nonce by ${nonceId}`)
    const nonce = await this.authDao.loadNonce(nonceId)
    if (!nonce) {
      logger.error(`AuthService: nonce not found`)
      throw new Error(`${wallet} is not registered`)
    }
    logger.debug(`AuthService: end to load nonce`)
    logger.debug(nonce)

    try {
      const msg = `I am signing my one-time nonce: ${nonce.nonce}`

      // We now are in possession of msg, wallet and signature. We
      // will use a helper from eth-sig-util to extract the address from the signature
      const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'))
      const address = sigUtil.recoverPersonalSignature({
        signature,
        data: msgBufferHex
      })

      // The signature verification is successful if the address found with
      // sigUtil.recoverPersonalSignature matches the initial wallet
      if (address.toLocaleLowerCase() !== wallet.toLocaleLowerCase()) {
        throw new Error('Signature verification failed')
      }

      let accountProfile = await this.accountService.loadAccountProfileByAddress(address)
      if (!accountProfile) {
        const account = await this.accountService.createAccount(address)
        accountProfile = account.profile
      }

      const payload = this.cryptoService.encrypt(JSON.stringify({
        id: accountProfile.id,
        address: accountProfile.address
      }))

      return {
        id: accountProfile.id,
        address: accountProfile.address,
        accessToken: jwt.sign(
          {
            data: payload
          },
          accountProfile.secret,
          {
            algorithm: JWT_ALGORITHM,
            expiresIn: JWT_EXPIRES
          }
        )
      }
    } finally {
      logger.debug(`AuthService: start to delete nonce ${nonceId}`)
      await this.authDao.deleteNonce(nonceId)
      logger.debug('AuthService: end to delete nonce')
    }
  }
}
