import { SharedAccount } from '@repo/dao/src/interfaces/shared-account'

export interface SharedAccountWithId extends SharedAccount {
  _id: string
}
