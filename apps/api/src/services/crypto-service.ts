import * as crypto from 'crypto'
import { customAlphabet } from 'nanoid'

import appConfig from '@repo/common/dist/src/app-config'

export interface CryptoService {
  generateRandom(size?: number | undefined): string
  generateSecret(size: number): string
  encrypt(text: string): string
  decrypt(text: string): string
}

export class CryptoServiceImpl implements CryptoService {
  public generateRandom(size?: number | undefined): string {
    const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', size)
    return nanoid()
  }

  public generateSecret(size: number): string {
    return crypto.randomBytes(size).toString('hex')
  }

  public encrypt(text: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(appConfig.JWT_ENCRYPTION_KEY), Buffer.from(appConfig.JWT_INIT_VECTOR))
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  }

  public decrypt(text: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(appConfig.JWT_ENCRYPTION_KEY), Buffer.from(appConfig.JWT_INIT_VECTOR))
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  }
}
