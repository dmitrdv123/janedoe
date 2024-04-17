import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { ExchangeRate } from '@repo/dao/dist/src/interfaces/exchange-rate'
import { ExchangeRateDao } from '@repo/dao/dist/src/dao/exchange-rate.dao'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, batchWriteItemsByChunks } from '../utils/dynamo-utils'

export class ExchangeRateDaoImpl implements ExchangeRateDao {
  private static readonly PK_PREFIX = 'exchange_rate'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async loadExchangeRate(currency: string, timestamp: number): Promise<ExchangeRate | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME_TIME_SERIES,
      Key: marshall({
        pk: generateKey(ExchangeRateDaoImpl.PK_PREFIX, currency.toLocaleLowerCase(), timestamp),
        sk: timestamp
      })
    })

    return result.Item ? unmarshall(result.Item).exchangeRate as ExchangeRate : undefined
  }

  public async saveExchangeRates(exchangeRates: ExchangeRate[]): Promise<void> {
    const putRequests = exchangeRates.map(exchangeRate => ({
      PutRequest: {
        Item: marshall({
          pk: generateKey(ExchangeRateDaoImpl.PK_PREFIX, exchangeRate.currency.toLocaleLowerCase(), exchangeRate.timestamp),
          sk: exchangeRate.timestamp,
          exchangeRate
        })
      }
    }))

    await batchWriteItemsByChunks(this.dynamoService, appConfig.TABLE_NAME_TIME_SERIES, putRequests)
  }
}
