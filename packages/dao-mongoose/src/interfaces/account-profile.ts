import { Account } from '@repo/dao/src/interfaces/account-profile'

export interface AccountWithId extends Account {
  _id: string
}
