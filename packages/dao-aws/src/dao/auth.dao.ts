import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { AuthDao } from '@repo/dao/dist/src/dao/auth.dao'
import { Nonce } from '@repo/dao/dist/src/interfaces/nonce'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey } from '../utils/dynamo-utils'

export class AuthDaoImpl implements AuthDao {
  private static readonly PK_PREFIX = 'auth'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async saveNonce(nonce: Nonce): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(AuthDaoImpl.PK_PREFIX, nonce.nonceId),
        sk: nonce.nonceId,
        nonce
      })
    })
  }

  public async loadNonce(nonceId: string): Promise<Nonce | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AuthDaoImpl.PK_PREFIX, nonceId),
        sk: nonceId,
      })
    })

    return result.Item ? unmarshall(result.Item).nonce as Nonce : undefined
  }

  public async deleteNonce(nonceId: string): Promise<void> {
    await this.dynamoService.deleteItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(AuthDaoImpl.PK_PREFIX, nonceId),
        sk: nonceId
      })
    })
  }
}
