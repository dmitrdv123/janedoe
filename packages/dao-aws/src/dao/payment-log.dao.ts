import { marshall } from '@aws-sdk/util-dynamodb'

import { PaymentLogDao } from '@repo/dao/dist/src/dao/payment-log.dao'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { PaymentFilter } from '@repo/dao/dist/src/interfaces/payment-filter'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, queryItems } from '../utils/dynamo-utils'
import { QueryInput } from '@aws-sdk/client-dynamodb'

export class PaymentLogDaoImpl implements PaymentLogDao {
  private static readonly PK_PREFIX = 'payment_log'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async savePaymentLog(paymentLog: PaymentLog): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(PaymentLogDaoImpl.PK_PREFIX, paymentLog.accountId),
        sk: generateKey(paymentLog.paymentId, paymentLog.blockchain.toLocaleLowerCase(), paymentLog.transaction, paymentLog.index),
        paymentFilter: {
          paymentId: paymentLog.paymentId.toLocaleLowerCase(),

          block: paymentLog.block.toLocaleLowerCase(),
          timestamp: paymentLog.timestamp,
          transaction: paymentLog.transaction.toLocaleLowerCase(),

          from: paymentLog.from?.toLocaleLowerCase() ?? null,
          to: paymentLog.to.toLocaleLowerCase(),
          direction: paymentLog.direction.toLocaleLowerCase(),

          blockchain: paymentLog.blockchain.toLocaleLowerCase(),
          tokenAddress: paymentLog.tokenAddress?.toLocaleLowerCase() ?? null,
          tokenSymbol: paymentLog.tokenSymbol?.toLocaleLowerCase() ?? null
        },
        paymentLog
      })
    })
  }

  public async listPaymentLogs(id: string, filter?: PaymentFilter): Promise<PaymentLog[]> {
    const filterExpressions = []
    const keyConditionExpression = []

    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    keyConditionExpression.push('pk = :pkValue')
    expressionAttributeValues[':pkValue'] = generateKey(PaymentLogDaoImpl.PK_PREFIX, id)

    if (filter?.paymentId) {
      keyConditionExpression.push('begins_with(sk, :skFilter)')
      expressionAttributeValues[':skFilter'] = filter.paymentId
    }

    if (filter?.timestampFrom) {
      filterExpressions.push('paymentFilter.#logTimestamp >= :timestampFrom')
      expressionAttributeNames['#logTimestamp'] = 'timestamp'
      expressionAttributeValues[':timestampFrom'] = filter.timestampFrom
    }

    if (filter?.timestampTo) {
      filterExpressions.push('paymentFilter.#logTimestamp <= :timestampTo')
      expressionAttributeNames['#logTimestamp'] = 'timestamp'
      expressionAttributeValues[':timestampTo'] = filter.timestampTo
    }

    if (filter?.transaction) {
      filterExpressions.push('contains(paymentFilter.#blockchainTransaction, :blockchainTransaction)')
      expressionAttributeNames['#blockchainTransaction'] = 'transaction'
      expressionAttributeValues[':blockchainTransaction'] = filter.transaction.toLocaleLowerCase()
    }

    if (filter?.blockchains && filter.blockchains.length > 0) {
      const blockchainValues = filter.blockchains.map(item => item.toLocaleLowerCase())
      const blockchainPlaceholders = blockchainValues.map(item => `:blockchain_${item}`)

      filterExpressions.push(`paymentFilter.blockchain IN (${blockchainPlaceholders.join(',')})`)
      blockchainPlaceholders.forEach((blockchainPlaceholder, i) => {
        expressionAttributeValues[blockchainPlaceholder] = blockchainValues[i]
      })
    }

    if (filter?.from) {
      filterExpressions.push('contains(paymentFilter.#addressFrom, :addressFrom)')
      expressionAttributeNames['#addressFrom'] = 'from'
      expressionAttributeValues[':addressFrom'] = filter.from.toLocaleLowerCase()
    }

    if (filter?.to) {
      filterExpressions.push('contains(paymentFilter.#addressTo, :addressTo)')
      expressionAttributeNames['#addressTo'] = 'to'
      expressionAttributeValues[':addressTo'] = filter.to.toLocaleLowerCase()
    }

    if (filter?.direction) {
      filterExpressions.push('contains(paymentFilter.#direction, :direction)')
      expressionAttributeNames['#direction'] = 'direction'
      expressionAttributeValues[':direction'] = filter.direction.toLocaleLowerCase()
    }

    const request: QueryInput = {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: keyConditionExpression.join(' and '),
      FilterExpression: filterExpressions.length ? filterExpressions.join(' and ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    }
    const paymentLogs = await queryItems<PaymentLog>(this.dynamoService, 'paymentLog', request)

    return paymentLogs.sort((a, b) => {
      if (a.timestamp > b.timestamp) {
        return -1
      }
      if (a.timestamp < b.timestamp) {
        return 1
      }
      if (a.blockchain > b.blockchain) {
        return 1
      }
      if (a.blockchain < b.blockchain) {
        return -1
      }
      if (a.transaction > b.transaction) {
        return 1
      }
      if (a.transaction < b.transaction) {
        return -1
      }
      if (a.index > b.index) {
        return -1
      }
      if (a.index < b.index) {
        return 1
      }
      return 0
    })
  }
}
