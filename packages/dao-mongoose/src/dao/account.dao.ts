import { AccountDao } from '@repo/dao/src/dao/account.dao'
import { Account, AccountProfile } from '@repo/dao/src/interfaces/account-profile'
import { AccountApiSettings, AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountSettings, AccountTeamSettings } from '@repo/dao/src/interfaces/account-settings'

import { AccountWithId } from '../interfaces/account-profile'
import { AccountModel } from '../models/account.model'
import { SharedAccountModel } from '../models/shared-account.model'
import { SharedAccount } from '@repo/dao/src/interfaces/shared-account'

export class AccountDaoImpl implements AccountDao {
  public async loadAccount(id: string): Promise<Account | undefined> {
    const account = await AccountModel.findOne({ _id: id })
    return account?.toJSON()
  }

  public async saveAccount(account: Account): Promise<void> {
    const accountWithId: AccountWithId = {
      ...account,
      _id: account.profile.id
    }

    await AccountModel.create(accountWithId)
  }

  public async listAccountProfiles(): Promise<AccountProfile[]> {
    throw new Error('Unimplemented method')
  }

  public async loadAccountProfile(id: string): Promise<AccountProfile | undefined> {
    const account = await AccountModel.findOne({ _id: id }).select('profile')
    return account?.profile
  }

  public async loadAccountProfileByAddress(address: string): Promise<AccountProfile | undefined> {
    const account = await AccountModel.findOne({ 'profile.address': address.toLocaleLowerCase() }).select('profile')
    return account?.profile
  }

  public async loadAccountProfileByApiKey(apiKey: string): Promise<AccountProfile | undefined> {
    const account = await AccountModel.findOne({ 'settings.apiSettings.apiKey': apiKey }).select('profile')
    return account?.profile
  }

  public async loadSharedAccount(shareToAddress: string, sharedAccountId: string): Promise<SharedAccount | undefined> {
    const sharedAccount = await SharedAccountModel.findById(
      { _id: [shareToAddress.toLocaleLowerCase(), sharedAccountId].join(':') },
    )

    return sharedAccount?.toJSON()
  }

  public async listSharedAccounts(address: string): Promise<SharedAccount[]> {
    const sharedAccounts = await SharedAccountModel.find()
      .where({
        _id: {
          $regex: new RegExp('^' + address + ':', 'i')
        }
      })
    const result = sharedAccounts.map(item => item.toJSON())
    return result
  }

  public async loadAccountSettings(id: string): Promise<AccountSettings | undefined> {
    const account = await AccountModel.findOne({ _id: id }).select('settings')

    return account
      ? {
        commonSettings: account.settings.commonSettings,
        notificationSettings: {
          callbackUrl: account.settings.notificationSettings.callbackUrl,
          secretKey: account.settings.notificationSettings.secretKey
        },
        apiSettings: {
          apiKey: account.settings.apiSettings.apiKey
        },
        teamSettings: {
          users: account.settings.teamSettings.users.map(item => ({
            accountTeamUserSettingsId: item.accountTeamUserSettingsId,
            address: item.address,
            permissions: item.permissions
          }))
        },
        paymentSettings: {
          blockchains: account.settings.paymentSettings.blockchains,
          assets: account.settings.paymentSettings.assets.map(item => ({
            blockchain: item.blockchain,
            address: item.address,
            symbol: item.symbol
          }))
        }
      }
      : undefined
  }

  public async saveAccountPaymentSettings(id: string, paymentSettings: AccountPaymentSettings): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { _id: id },
      { $set: { 'settings.paymentSettings': paymentSettings } }
    )
  }

  public async saveAccountCommonSettings(id: string, commonSettings: AccountCommonSettings): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { _id: id },
      { $set: { 'settings.commonSettings': commonSettings } }
    )
  }

  public async saveAccountNotificationSettings(id: string, notificationSettings: AccountNotificationSettings): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { _id: id },
      { $set: { 'settings.notificationSettings': notificationSettings } }
    )
  }

  public async saveAccountTeamSettings(id: string, address: string, teamSettings: AccountTeamSettings): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { _id: id },
      { $set: { 'settings.teamSettings': { users: teamSettings.users } } }
    )

    await SharedAccountModel.deleteMany({
      sharedAccountId: id
    })

    await SharedAccountModel.insertMany(
      teamSettings.users.map(item => ({
        _id: [item.address.toLocaleLowerCase(), id].join(':'),
        sharedAccountId: id,
        sharedAddress: address,
        shareToAddress: item.address,
        permissions: item.permissions
      }))
    )
  }

  public async saveAccountApiKeySettings(id: string, apiSettings: AccountApiSettings): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { _id: id },
      { $set: { 'settings.apiSettings': apiSettings } }
    )
  }

  public async deleteAccountApiKeySettings(id: string): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { _id: id },
      { $set: { 'settings.apiSettings': { apiKey: undefined } } }
    )
  }
}
