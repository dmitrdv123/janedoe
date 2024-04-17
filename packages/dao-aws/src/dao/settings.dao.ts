import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { SettingsDao } from '@repo/dao/dist/src/dao/settings.dao'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey } from '../utils/dynamo-utils'

export class SettingsDaoImpl implements SettingsDao {
  private static readonly PK_SETTINGS_PREFIX = 'settings'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async loadSettings<T>(prefix: string, ...keys: string[]): Promise<T | undefined> {
    const key = generateKey(prefix.toLocaleLowerCase(), ...keys.map(key => key.toLocaleLowerCase()))

    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(SettingsDaoImpl.PK_SETTINGS_PREFIX, key),
        sk: key
      })
    })

    return result.Item ? unmarshall(result.Item).settings as T : undefined
  }

  public async saveSettings<T>(settings: T, prefix: string, ...keys: string[]): Promise<void> {
    const key = generateKey(prefix.toLocaleLowerCase(), ...keys.map(key => key.toLocaleLowerCase()))

    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(SettingsDaoImpl.PK_SETTINGS_PREFIX, key),
        sk: key,
        settings
      })
    })
  }
}
