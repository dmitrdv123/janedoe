import { AttributeValue, QueryInput, ScanInput, WriteRequest } from '@aws-sdk/client-dynamodb'

import { DYNAMO_BATCH_SIZE, DYNAMO_READ_BATCH_SIZE } from '../constants'
import { DynamoService } from '../services/dynamo.service'
import { unmarshall } from '@aws-sdk/util-dynamodb'

export function generateKey(...args: unknown[]): string {
  return args.map(item => !!item || item === 0 ? item : '').join('#')
}

export function generateKeyForSecret(...args: unknown[]): string {
  return args.map(item => !!item || item === 0 ? item : '').join('.')
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

export async function batchReadItemsByChunks<T>(dynamoService: DynamoService, tableName: string, field: string, requests: Record<string, AttributeValue>[]): Promise<T[]> {
  let allItems: T[] = []

  for (let i = 0; i < requests.length; i += DYNAMO_READ_BATCH_SIZE) {
    let requestsToProcess: Record<string, AttributeValue>[] | undefined = requests.slice(i, i + DYNAMO_READ_BATCH_SIZE)
    do {
      const result = await dynamoService.batchReadItems({
        RequestItems: {
          [tableName]: {
            Keys: requestsToProcess
          }
        }
      })

      if (result.Responses?.[tableName]) {
        const items = result.Responses?.[tableName].map(item => unmarshall(item)[field])
        allItems = allItems.concat(items)
      }

      requestsToProcess = result.UnprocessedKeys?.[tableName]?.Keys
    } while (requestsToProcess)
  }

  return allItems
}

export async function queryItems<T>(dynamoService: DynamoService, request: QueryInput, field?: string | undefined): Promise<T[]> {
  let allItems: T[] = []
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined

  do {
    const nextResult = await dynamoService.queryItems({
      ...request,
      ExclusiveStartKey: lastEvaluatedKey,
    })

    if (nextResult.Items) {
      allItems = allItems.concat(
        nextResult.Items.map(item =>
          field ? unmarshall(item)[field] : item
        )
      )
    }

    lastEvaluatedKey = nextResult.LastEvaluatedKey
  } while (lastEvaluatedKey)

  return allItems
}

export async function scanItems<T>(dynamoService: DynamoService, field: string, request: ScanInput): Promise<T[]> {
  let allItems: T[] = []
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined

  do {
    const nextResult = await dynamoService.scanItems({
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
