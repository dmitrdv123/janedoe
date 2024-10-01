import { Nonce } from '@repo/dao/dist/src/interfaces/nonce'

export interface NonceWithId extends Nonce {
  _id: string
}
