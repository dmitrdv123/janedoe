import { AccountApiSettings, AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountSettings, AccountTeamSettings } from '../interfaces/account-settings'
import { Account, AccountProfile } from '../interfaces/account-profile'
import { SharedAccount } from '../interfaces/shared-account'

export interface AccountDao {
  loadAccount(id: string): Promise<Account | undefined>
  saveAccount(account: Account): Promise<void>

  listAccountProfiles(): Promise<AccountProfile[]>
  loadAccountProfile(id: string): Promise<AccountProfile | undefined>
  loadAccountProfileByAddress(address: string): Promise<AccountProfile | undefined>
  loadAccountProfileByApiKey(apiKey: string): Promise<AccountProfile | undefined>

  loadSharedAccount(shareToAddress: string, sharedAccountId: string): Promise<SharedAccount | undefined>
  listSharedAccounts(address: string): Promise<SharedAccount[]>

  loadAccountSettings(id: string): Promise<AccountSettings | undefined>

  saveAccountPaymentSettings(id: string, paymentSettings: AccountPaymentSettings): Promise<void>
  saveAccountCommonSettings(id: string, commonSettings: AccountCommonSettings): Promise<void>
  saveAccountNotificationSettings(id: string, notificationSettings: AccountNotificationSettings): Promise<void>
  saveAccountTeamSettings(id: string, address: string, teamSettings: AccountTeamSettings): Promise<void>

  saveAccountApiKeySettings(id: string, apiSettings: AccountApiSettings): Promise<void>
  deleteAccountApiKeySettings(id: string): Promise<void>
}
