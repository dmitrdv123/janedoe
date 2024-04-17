import { Permission } from './account-settings'

export interface SharedAccount {
  sharedAccountId: string,
  sharedAddress: string
  shareToAddress: string
  permissions: { [key: string]: Permission }
}
