import * as crypto from 'crypto'
import { marshall } from '@aws-sdk/util-dynamodb'

import { SupportDao } from '@repo/dao/dist/src/dao/support.dao'
import { SupportTicket } from '@repo/dao/dist/src/interfaces/support-ticket'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey } from '../utils/dynamo-utils'

export class SupportDaoImpl implements SupportDao {
  private static readonly PK_PREFIX = 'support'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async saveTicket(ticket: SupportTicket): Promise<string> {
    const id = crypto.randomUUID()

    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(SupportDaoImpl.PK_PREFIX, id),
        sk: id,
        ticket
      })
    })

    return id
  }
}
