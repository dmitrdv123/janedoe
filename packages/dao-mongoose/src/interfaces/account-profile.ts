import { Account } from '@repo/dao/dist/src/interfaces/account-profile'

export interface AccountWithId extends Account {
  _id: string
}
