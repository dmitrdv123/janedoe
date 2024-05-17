import { Asset } from 'rango-sdk-basic'

export interface AccountRbacSettings {
  isOwner: boolean
  ownerAddress: string
  permissions: { [key: string]: Permission }
}

export interface AccountCommonSettings {
  email: string | null
  description: string | null
  currency: string | null
}

export interface AccountNotificationSettings {
  callbackUrl: string | null
  secretKey: string | null
}

export interface AccountApiSettings {
  apiKey: string | null
}

export interface AccountPaymentSettings {
  disableConversion: boolean
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
  rbacSettings: AccountRbacSettings | undefined
  paymentSettings: AccountPaymentSettings | undefined
  commonSettings: AccountCommonSettings | undefined
  notificationSettings: AccountNotificationSettings | undefined
  apiSettings: AccountApiSettings | undefined
  teamSettings: AccountTeamSettings | undefined
}

export type Permission = 'Disable' | 'View' | 'Modify'
export type PermissionKey = 'balances' | 'payments' | 'common_settings' | 'notification_settings' | 'api_settings' | 'team_settings' | 'payment_settings'
