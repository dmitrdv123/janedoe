import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { Token } from 'rango-sdk-basic'

import { MetaDao } from '@repo/dao/dist/src/dao/meta.dao'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, batchWriteItemsByChunks } from '../utils/dynamo-utils'
import { TTL_TOKENS } from '../constants'

export class MetaDaoImpl implements MetaDao {
  private static readonly PK_PREFIX = 'token'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async listTokens(timestamp: number, blockchain: string, address: string | null): Promise<Token[]> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME_TIME_SERIES,
      Key: marshall({
        pk: this.generateKey(blockchain, address, timestamp),
        sk: timestamp
      })
    })

    return result.Item ? unmarshall(result.Item).tokens as Token[] : []
  }

  public async saveTokens(timestamp: number, tokens: Token[]): Promise<void> {
    const tokensByPk: { [key: string]: Token[] } = tokens.reduce((acc, token) => {
      const pk = this.generateKey(token.blockchain, token.address, timestamp)

      if (!acc[pk]) {
        acc[pk] = []
      }
      acc[pk].push(token)

      return acc
    }, {} as { [key: string]: Token[] })

    const putRequests = Object.keys(tokensByPk).map(pk => ({
      PutRequest: {
        Item: marshall({
          pk,
          sk: timestamp,
          tokens: tokensByPk[pk],
          ttl: timestamp + TTL_TOKENS
        })
      }
    }))

    await batchWriteItemsByChunks(this.dynamoService, appConfig.TABLE_NAME_TIME_SERIES, putRequests)
  }

  private generateKey(blockchain: string, address: string | null, timestamp: number): string {
    return generateKey(MetaDaoImpl.PK_PREFIX, blockchain.toLocaleLowerCase(), address?.toLocaleLowerCase() ?? '', timestamp)
  }
}
