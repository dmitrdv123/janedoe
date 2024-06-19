import { AttributeValue, QueryInput, WriteRequest } from '@aws-sdk/client-dynamodb'

import { DYNAMO_BATCH_SIZE } from '../constants'
import { DynamoService } from '../services/dynamo.service'
import { unmarshall } from '@aws-sdk/util-dynamodb'

export function generateKey(...args: unknown[]): string {
  return generateKeyWithSeparator('#', args)
}

export function generateKeyWithSeparator(separator: string, ...args: unknown[]): string {
  return args.map(item => !!item || item === 0 ? item : '').join(separator)
}

export async function batchWriteItemsByChunks(dynamoService: DynamoService, tableName: string, requests: WriteRequest[]): Promise<void> {
  for (let i = 0; i < requests.length; i += DYNAMO_BATCH_SIZE) {
    await dynamoService.batchWriteItems({
      RequestItems: {
        [tableName]: requests.slice(i, i + DYNAMO_BATCH_SIZE)
      }
    })
  }
}

export async function queryItems<T>(dynamoService: DynamoService, field: string, request: QueryInput): Promise<T[]> {
  let allItems: T[] = []
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined

  do {
    const nextResult = await dynamoService.queryItems({
      ...request,
      ExclusiveStartKey: lastEvaluatedKey,
    })

    if (nextResult.Items) {
      allItems = allItems.concat(
        nextResult.Items.map(item => unmarshall(item)[field])
      )
    }

    lastEvaluatedKey = nextResult.LastEvaluatedKey
  } while (lastEvaluatedKey)

  return allItems
}
