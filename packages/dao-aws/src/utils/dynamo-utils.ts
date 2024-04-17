import { WriteRequest } from '@aws-sdk/client-dynamodb'

import { DYNAMO_BATCH_SIZE } from '../constants'
import { DynamoService } from '../services/dynamo.service'

export function generateKey(...args: unknown[]): string {
  return args.map(item => !!item || item === 0 ? item : '').join('#')
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
