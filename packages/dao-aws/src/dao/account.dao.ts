import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import { Account, AccountProfile } from '@repo/dao/dist/src/interfaces/account-profile'
import { AccountApiSettings, AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountSettings, AccountTeamSettings } from '@repo/dao/dist/src/interfaces/account-settings'
import { SharedAccount } from '@repo/dao/dist/src/interfaces/shared-account'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, batchWriteItemsByChunks, queryItems, scanItems } from '../utils/dynamo-utils'
import { ApiKeyData } from '../interfaces/api-key-data'

export class AccountDaoImpl implements AccountDao {
  private static readonly PK_PREFIX = 'account'
  private static readonly PK_SHARED_ACCOUNT_PREFIX = 'shared_account'
  private static readonly PK_API_KEY_PREFIX = 'api_key'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async loadAccount(id: string): Promise<Account | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id,
      })
    })
    return result.Item ? unmarshall(result.Item).account as Account : undefined
  }

  public async saveAccount(account: Account): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, account.profile.id),
        sk: account.profile.id,
        gsi_pk1: generateKey(AccountDaoImpl.PK_PREFIX, account.profile.address.toLocaleLowerCase()),
        gsi_sk1: account.profile.address.toLocaleLowerCase(),
        account
      })
    })
  }

  public async listAccountProfiles(): Promise<AccountProfile[]> {
    const request = {
      TableName: appConfig.TABLE_NAME,
      FilterExpression: 'begins_with(pk, :pk_prefix)',
      ExpressionAttributeValues: marshall({
        ':pk_prefix': `${AccountDaoImpl.PK_PREFIX}#`
      }),
      ProjectionExpression: 'account.profile'
    }
    const accounts = await scanItems<Partial<Account>>(this.dynamoService, 'account', request)

    return accounts.reduce((acc, account) => {
      if (account.profile) {
        acc.push(account.profile)
      }
      return acc
    }, [] as AccountProfile[])
  }

  public async loadAccountProfile(id: string): Promise<AccountProfile | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      ProjectionExpression: 'account.profile'
    })

    const account = result.Item ? unmarshall(result.Item).account as Account : undefined
    return account?.profile
  }

  public async loadAccountProfileByAddress(address: string): Promise<AccountProfile | undefined> {
    const result = await this.dynamoService.queryItems({
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk1-gsi_sk1-index',
      KeyConditionExpression: 'gsi_pk1 = :pk and gsi_sk1= :sk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(AccountDaoImpl.PK_PREFIX, address.toLocaleLowerCase()),
        ':sk': address.toLocaleLowerCase()
      }),
      ProjectionExpression: 'account.profile',
      Limit: 1
    })

    const account = result.Items && result.Items.length > 0 ? unmarshall(result.Items[0]).account as Account : undefined
    return account?.profile
  }

  public async loadAccountProfileByApiKey(apiKey: string): Promise<AccountProfile | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_API_KEY_PREFIX, apiKey),
        sk: apiKey
      })
    })

    const apiKeyData = result.Item ? unmarshall(result.Item).apiKeyData as ApiKeyData : undefined
    return apiKeyData ? await this.loadAccountProfile(apiKeyData.accountId) : undefined
  }

  public async loadSharedAccount(shareToAddress: string, sharedAccountId: string): Promise<SharedAccount | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_SHARED_ACCOUNT_PREFIX, shareToAddress.toLocaleLowerCase()),
        sk: sharedAccountId
      })
    })

    return result.Item ? unmarshall(result.Item).sharedAccount as SharedAccount : undefined
  }

  public async listSharedAccounts(address: string): Promise<SharedAccount[]> {
    const request = {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk_value',
      ExpressionAttributeValues: marshall({
        ':pk_value': generateKey(AccountDaoImpl.PK_SHARED_ACCOUNT_PREFIX, address.toLocaleLowerCase())
      }),
      ScanIndexForward: false
    }

    return await queryItems(this.dynamoService, 'sharedAccount', request)
  }

  public async loadAccountSettings(id: string): Promise<AccountSettings | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      ProjectionExpression: 'account.settings'
    })

    const account = result.Item ? unmarshall(result.Item).account as Account : undefined
    return account?.settings
  }

  public async saveAccountPaymentSettings(id: string, paymentSettings: AccountPaymentSettings): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      UpdateExpression: 'SET account.settings.paymentSettings = :paymentSettings',
      ExpressionAttributeValues: marshall({
        ':paymentSettings': paymentSettings
      })
    })
  }

  public async saveAccountCommonSettings(id: string, commonSettings: AccountCommonSettings): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      UpdateExpression: 'SET account.settings.commonSettings = :commonSettings',
      ExpressionAttributeValues: marshall({
        ':commonSettings': commonSettings
      })
    })
  }

  public async saveAccountNotificationSettings(id: string, notificationSettings: AccountNotificationSettings): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      UpdateExpression: 'SET account.settings.notificationSettings = :notificationSettings',
      ExpressionAttributeValues: marshall({
        ':notificationSettings': notificationSettings
      })
    })
  }

  public async saveAccountTeamSettings(id: string, address: string, teamSettings: AccountTeamSettings): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      UpdateExpression: 'SET account.settings.teamSettings = :teamSettings',
      ExpressionAttributeValues: marshall({
        ':teamSettings': teamSettings
      })
    })

    const request = {
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk1-gsi_sk1-index',
      KeyConditionExpression: 'gsi_pk1 = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(AccountDaoImpl.PK_SHARED_ACCOUNT_PREFIX, id),
      })
    }
    const sharedAccounts = await queryItems<SharedAccount>(this.dynamoService, 'sharedAccount', request)

    const deleteRequests = sharedAccounts.map(sharedAccount => ({
      DeleteRequest: {
        Key: marshall({
          pk: generateKey(AccountDaoImpl.PK_SHARED_ACCOUNT_PREFIX, sharedAccount.shareToAddress.toLocaleLowerCase()),
          sk: sharedAccount.sharedAccountId
        })
      }
    }))
    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      deleteRequests
    )

    const putRequests = teamSettings.users.map(item => {
      const sharedAccount: SharedAccount = {
        sharedAccountId: id,
        sharedAddress: address,
        shareToAddress: item.address,
        permissions: item.permissions
      }

      return {
        PutRequest: {
          Item: marshall({
            pk: generateKey(AccountDaoImpl.PK_SHARED_ACCOUNT_PREFIX, item.address.toLocaleLowerCase()),
            sk: id,
            gsi_pk1: generateKey(AccountDaoImpl.PK_SHARED_ACCOUNT_PREFIX, id),
            gsi_sk1: item.address.toLocaleLowerCase(),
            sharedAccount
          })
        }
      }
    })
    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      putRequests
    )
  }

  public async saveAccountApiKeySettings(id: string, apiSettings: AccountApiSettings): Promise<void> {
    const accountResult = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      ProjectionExpression: 'account.settings.apiSettings'
    })

    const account = accountResult.Item ? unmarshall(accountResult.Item).account as Account : undefined
    const existedApiKey = account?.settings.apiSettings.apiKey
    if (existedApiKey) {
      await this.dynamoService.deleteItem({
        TableName: appConfig.TABLE_NAME,
        Key: marshall({
          pk: generateKey(AccountDaoImpl.PK_API_KEY_PREFIX, existedApiKey),
          sk: existedApiKey,
        })
      })
    }

    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AccountDaoImpl.PK_PREFIX, id),
        sk: id
      }),
      UpdateExpression: 'SET account.settings.apiSettings = :apiSettings',
      ExpressionAttributeValues: marshall({
        ':apiSettings': apiSettings
      }, { removeUndefinedValues: true }),
    })

    if (apiSettings.apiKey) {
      const apiKeyData: ApiKeyData = {
        accountId: id,
        apiKey: apiSettings.apiKey
      }

      await this.dynamoService.putItem({
        TableName: appConfig.TABLE_NAME,
        Item: marshall({
          pk: generateKey(AccountDaoImpl.PK_API_KEY_PREFIX, apiSettings.apiKey),
          sk: apiSettings.apiKey,
          apiKeyData
        })
      })
    }
  }

  public async deleteAccountApiKeySettings(id: string): Promise<void> {
    await this.saveAccountApiKeySettings(id, { apiKey: null })
  }
}
