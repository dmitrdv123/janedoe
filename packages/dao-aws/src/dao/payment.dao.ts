import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { QueryInput, AttributeValue } from '@aws-sdk/client-dynamodb'

import { PaymentSuccess, PaymentSuccessFilter } from '@repo/dao/dist/src/interfaces/payment-success'
import appConfig from '@repo/common/dist/src/app-config'
import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { PaymentHistory, PaymentHistoryFilter } from '@repo/dao/dist/src/interfaces/payment-history'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { IpnKey, IpnResult } from '@repo/dao/dist/src/interfaces/ipn'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, queryItems } from '../utils/dynamo-utils'

export class PaymentDaoImpl implements PaymentDao {
  private static readonly PK_PREFIX = 'payment'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async listPaymentHistory(accountId: string, filter?: PaymentHistoryFilter): Promise<PaymentHistory[]> {
    const items = await this.listPaymentItems<Record<string, AttributeValue>>(accountId, filter)
    return items
      .reduce((acc: PaymentHistory[], item) => {
        const unmarshalledItem = unmarshall(item)

        const paymentLog: PaymentLog | null = unmarshalledItem.payment_log
        const paymentSuccess: PaymentSuccess | null = unmarshalledItem.payment_success
        const ipnResult: IpnResult | null = unmarshalledItem.ipn_result

        if (paymentLog) {
          acc.push({
            ...paymentLog,
            paymentSuccess,
            ipnResult
          })
        }

        return acc
      }, [])
      .sort((a, b) => {
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

  public async savePaymentLog(paymentLog: PaymentLog): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, paymentLog.accountId),
        sk: generateKey(paymentLog.paymentId, paymentLog.blockchain.toLocaleLowerCase(), paymentLog.transaction, paymentLog.index)
      }),
      UpdateExpression: `
        SET payment_log = :payment_log,
        payment_log_filter = :payment_log_filter,
        payment_success = if_not_exists(payment_success, :nullValue),
        payment_success_filter = if_not_exists(payment_success_filter, :nullValue)
      `,
      ExpressionAttributeValues: marshall({
        ':payment_log': paymentLog,
        ':payment_log_filter': {
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
        ':nullValue': null,
      }),
      ReturnValues: "UPDATED_NEW"
    })
  }

  public async listPaymentLogs(accountId: string, filter?: PaymentHistoryFilter): Promise<PaymentLog[]> {
    const paymentLogs = await this.listPaymentItems<PaymentLog>(accountId, filter, 'payment_log')
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

  public async savePaymentSuccess(paymentSuccess: PaymentSuccess): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, paymentSuccess.accountId),
        sk: generateKey(paymentSuccess.paymentId, paymentSuccess.blockchain.toLocaleLowerCase(), paymentSuccess.transaction, paymentSuccess.index)
      }),
      UpdateExpression: `
        SET payment_success = :payment_success,
        payment_success_filter = :payment_success_filter,
        payment_log = if_not_exists(payment_log, :nullValue),
        payment_log_filter = if_not_exists(payment_log_filter, :nullValue)
      `,
      ExpressionAttributeValues: marshall({
        ':payment_success': paymentSuccess,
        ':payment_success_filter': {
          email: paymentSuccess.email?.toLocaleLowerCase() ?? null,
          comment: paymentSuccess.comment?.toLocaleLowerCase() ?? null,
        },
        ':nullValue': null,
      }),
      ReturnValues: "UPDATED_NEW"
    })
  }

  public async loadPaymentSuccess(accountId: string, paymentId: string, blockchain: string, transaction: string, index: number): Promise<PaymentSuccess | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, accountId),
        sk: generateKey(paymentId, blockchain.toLocaleLowerCase(), transaction, index)
      }),
      ProjectionExpression: 'payment_success'
    })

    return result.Item ? unmarshall(result.Item).payment_success : undefined
  }

  public async saveIpnResult(ipnKey: IpnKey, ipnResult: IpnResult): Promise<void> {
    await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, ipnKey.accountId),
        sk: generateKey(ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index)
      }),
      UpdateExpression: `
        SET ipn_result = :ipn_result
      `,
      ExpressionAttributeValues: marshall({
        ':ipn_result': ipnResult
      }),
      ReturnValues: "UPDATED_NEW"
    })
  }

  public async loadIpnResult(ipnKey: IpnKey): Promise<IpnResult | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(PaymentDaoImpl.PK_PREFIX, ipnKey.accountId),
        sk: generateKey(ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index)
      }),
      ProjectionExpression: 'ipn_result'
    })

    return result.Item ? unmarshall(result.Item).ipn_result : undefined
  }

  private async listPaymentItems<T>(accountId: string, filter?: PaymentHistoryFilter | undefined, field?: string | undefined): Promise<T[]> {
    const filterExpressions = []
    const keyConditionExpression = []

    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    keyConditionExpression.push('pk = :pkValue')
    expressionAttributeValues[':pkValue'] = generateKey(PaymentDaoImpl.PK_PREFIX, accountId)

    if (filter?.paymentId) {
      keyConditionExpression.push('begins_with(sk, :skFilter)')
      expressionAttributeValues[':skFilter'] = filter.paymentId
    }

    if (filter?.timestampFrom) {
      filterExpressions.push('payment_log_filter.#logTimestamp >= :timestampFrom')
      expressionAttributeNames['#logTimestamp'] = 'timestamp'
      expressionAttributeValues[':timestampFrom'] = filter.timestampFrom
    }

    if (filter?.timestampTo) {
      filterExpressions.push('payment_log_filter.#logTimestamp <= :timestampTo')
      expressionAttributeNames['#logTimestamp'] = 'timestamp'
      expressionAttributeValues[':timestampTo'] = filter.timestampTo
    }

    if (filter?.transaction) {
      filterExpressions.push('contains(payment_log_filter.#blockchainTransaction, :blockchainTransaction)')
      expressionAttributeNames['#blockchainTransaction'] = 'transaction'
      expressionAttributeValues[':blockchainTransaction'] = filter.transaction.toLocaleLowerCase()
    }

    if (filter?.blockchains && filter.blockchains.length > 0) {
      const blockchainValues = filter.blockchains.map(item => item.toLocaleLowerCase())
      const blockchainPlaceholders = blockchainValues.map(item => `:blockchain_${item}`)

      filterExpressions.push(`payment_log_filter.blockchain IN (${blockchainPlaceholders.join(',')})`)
      blockchainPlaceholders.forEach((blockchainPlaceholder, i) => {
        expressionAttributeValues[blockchainPlaceholder] = blockchainValues[i]
      })
    }

    if (filter?.from) {
      filterExpressions.push('contains(payment_log_filter.#addressFrom, :addressFrom)')
      expressionAttributeNames['#addressFrom'] = 'from'
      expressionAttributeValues[':addressFrom'] = filter.from.toLocaleLowerCase()
    }

    if (filter?.to) {
      filterExpressions.push('contains(payment_log_filter.#addressTo, :addressTo)')
      expressionAttributeNames['#addressTo'] = 'to'
      expressionAttributeValues[':addressTo'] = filter.to.toLocaleLowerCase()
    }

    if (filter?.direction) {
      filterExpressions.push('contains(payment_log_filter.#direction, :direction)')
      expressionAttributeNames['#direction'] = 'direction'
      expressionAttributeValues[':direction'] = filter.direction.toLocaleLowerCase()
    }

    if (filter?.comment) {
      filterExpressions.push('contains(payment_success_filter.#comment, :comment)')
      expressionAttributeNames['#comment'] = 'comment'
      expressionAttributeValues[':comment'] = filter.comment.toLocaleLowerCase()
    }

    const request: QueryInput = {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: keyConditionExpression.join(' and '),
      FilterExpression: filterExpressions.length ? filterExpressions.join(' and ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    }

    return await queryItems<T>(this.dynamoService, request, field)
  }
}
