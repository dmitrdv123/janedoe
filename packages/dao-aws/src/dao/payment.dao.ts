import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { PaymentSuccessInfo } from '@repo/dao/dist/src/interfaces/payment-success-info'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, queryItems } from '../utils/dynamo-utils'
import { QueryInput } from '@aws-sdk/client-dynamodb'

export class PaymentDaoImpl implements PaymentDao {
  private static readonly PK_PREFIX = 'payment_success'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async saveSuccess(accountId: string, blockchain: string, txid: string, paymentSuccessInfo: PaymentSuccessInfo): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, accountId),
        sk: generateKey(blockchain.toLocaleLowerCase(), txid),
        paymentSuccessInfo
      })
    })
  }

  public async loadSuccess(accountId: string, blockchain: string, txid: string): Promise<PaymentSuccessInfo | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, accountId),
        sk: generateKey(blockchain.toLocaleLowerCase(), txid)
      })
    })

    return result.Item ? unmarshall(result.Item).paymentSuccessInfo as PaymentSuccessInfo : undefined
  }

  public async listSuccess(accountId: string, comment?: string | undefined): Promise<PaymentSuccessInfo[]> {
    const filterExpressions = []
    const keyConditionExpression = []

    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    keyConditionExpression.push('pk = :pkValue')
    expressionAttributeValues[':pkValue'] = generateKey(PaymentDaoImpl.PK_PREFIX, accountId)

    if (comment) {
      filterExpressions.push('contains(paymentSuccessInfo.#comment, :comment)')
      expressionAttributeNames['#comment'] = 'comment'
      expressionAttributeValues[':comment'] = comment.toLocaleLowerCase()
    }

    const request: QueryInput = {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: keyConditionExpression.join(' and '),
      FilterExpression: filterExpressions.length ? filterExpressions.join(' and ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    }

    const result = await queryItems<PaymentSuccessInfo>(this.dynamoService, 'paymentSuccessInfo', request)

    return result.sort((a, b) => {
      if (a.timestamp > b.timestamp) {
        return -1
      }
      if (a.timestamp < b.timestamp) {
        return 1
      }
      return 0
    })
  }
}
