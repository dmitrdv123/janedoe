import * as crypto from 'crypto'
import { CRYPTO_ALGORITHM } from '../constants'

export function encryptString(value: string, seed: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.createHash('sha256').update(seed).digest()
  const cipher = crypto.createCipheriv(CRYPTO_ALGORITHM, key, iv)

  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return iv.toString('hex') + ':' + encrypted
}

export function decryptString(value: string, seed: string): string {
  const [ivHex, encrypted] = value.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const key = crypto.createHash('sha256').update(seed).digest()
  const decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM, key, iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
