import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { PaymentSuccessInfo } from '@repo/dao/dist/src/interfaces/payment-success-info'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey } from '../utils/dynamo-utils'

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
}
