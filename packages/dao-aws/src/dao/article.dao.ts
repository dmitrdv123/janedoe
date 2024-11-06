import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue } from '@aws-sdk/client-dynamodb'

import { ArticleDao } from '@repo/dao/dist/src/dao/article.dao'
import appConfig from '@repo/common/dist/src/app-config'
import { Article } from '@repo/dao/dist/src/interfaces/article'

import { DynamoService } from '../services/dynamo.service'
import { batchWriteItemsByChunks, generateKey, queryItems } from '../utils/dynamo-utils'

export class ArticleDaoImpl implements ArticleDao {
  private static readonly PK_PREFIX = 'article'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async saveArticle(article: Article): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME_TIME_SERIES,
      Item: marshall({
        pk: generateKey(ArticleDaoImpl.PK_PREFIX),
        sk: article.timestamp,
        article
      })
    })
  }

  public async loadArticles(pageSize: number, timestamp?: number | undefined): Promise<Article[]> {
    const lastEvaluatedKey: Record<string, AttributeValue> | undefined = timestamp !== undefined
      ? marshall({
        pk: generateKey(ArticleDaoImpl.PK_PREFIX),
        sk: timestamp
      })
      : undefined

    const nextResult = await this.dynamoService.queryItems({
      TableName: appConfig.TABLE_NAME_TIME_SERIES,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(ArticleDaoImpl.PK_PREFIX)
      }),
      ExclusiveStartKey: lastEvaluatedKey,
      ScanIndexForward: false,  // This will sort by `sk` in descending order
      Limit: pageSize
    })

    return nextResult.Items
      ? nextResult.Items.map(item => unmarshall(item).article)
      : []
  }

  public async loadLatestArticle(): Promise<Article | undefined> {
    const result = await this.dynamoService.queryItems({
      TableName: appConfig.TABLE_NAME_TIME_SERIES,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(ArticleDaoImpl.PK_PREFIX),
      }),
      ScanIndexForward: false,  // This will sort by `sk` in descending order
      Limit: 1  // This ensures you get only the latest item
    })

    return result.Items && result.Items.length > 0  ? unmarshall(result.Items[0]).article as Article : undefined
  }

  public async deleteArticles(): Promise<void> {
    const request = {
      TableName: appConfig.TABLE_NAME_TIME_SERIES,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(ArticleDaoImpl.PK_PREFIX)
      })
    }
    const articles = await queryItems<Article>(this.dynamoService, request, 'article')

    const deleteRequests = articles.map(article => ({
      DeleteRequest: {
        Key: marshall({
          pk: generateKey(ArticleDaoImpl.PK_PREFIX),
          sk: article.timestamp
        })
      }
    }))
    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME_TIME_SERIES,
      deleteRequests
    )
  }
}
