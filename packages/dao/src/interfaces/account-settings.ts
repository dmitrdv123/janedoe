import { Asset } from 'rango-sdk-basic'

export interface AccountCommonSettings {
  email: string | null
  description: string | null
  currency: string
}

export interface AccountNotificationSettings {
  callbackUrl: string | null
  secretKey: string | null
}

export interface AccountApiSettings {
  apiKey: string | null
}

export type Permission = 'Disable' | 'View' | 'Modify'

export interface AccountPaymentSettings {
  blockchains: string[]
  assets: Asset[]
}

export interface AccountTeamUserSettings {
  accountTeamUserSettingsId: string
  address: string
  permissions: { [key: string]: Permission }
}

export interface AccountTeamSettings {
  users: AccountTeamUserSettings[]
}

export interface AccountSettings {
  commonSettings: AccountCommonSettings
  notificationSettings: AccountNotificationSettings
  apiSettings: AccountApiSettings
  teamSettings: AccountTeamSettings
  paymentSettings: AccountPaymentSettings
}
