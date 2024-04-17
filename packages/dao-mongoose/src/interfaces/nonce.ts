import { Nonce } from '@repo/dao/src/interfaces/nonce'

export interface NonceWithId extends Nonce {
  _id: string
}
