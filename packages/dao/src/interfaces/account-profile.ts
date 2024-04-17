import { AccountSettings } from './account-settings'

export interface AccountProfile {
  id: string,
  address: string,
  secret: string
}

export interface Account {
  profile: AccountProfile
  settings: AccountSettings
}
