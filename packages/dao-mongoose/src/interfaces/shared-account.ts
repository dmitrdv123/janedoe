import { SharedAccount } from '@repo/dao/dist/src/interfaces/shared-account'

export interface SharedAccountWithId extends SharedAccount {
  _id: string
}
