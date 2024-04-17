import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { IpnDao } from '@repo/dao/dist/src/dao/ipn.dao'
import { IpnData, IpnKey, IpnResult } from '@repo/dao/dist/src/interfaces/ipn'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey } from '../utils/dynamo-utils'

export class IpnDaoImpl implements IpnDao {
  private static readonly PK_IPN_PREFIX = 'ipn'
  private static readonly PK_IPN_RESULT_PREFIX = 'ipn_result'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async loadIpnData(ipnKey: IpnKey): Promise<IpnData | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: this.generateKey(IpnDaoImpl.PK_IPN_PREFIX, ipnKey),
        sk: this.generateSecondaryKey(ipnKey)
      })
    })

    return result.Item ? unmarshall(result.Item).ipn as IpnData : undefined
  }

  public async saveIpnData(ipn: IpnData): Promise<void> {
    const ipnKey = {
      accountId: ipn.accountId,
      paymentId: ipn.paymentId,
      blockchain: ipn.blockchain,
      transaction: ipn.transaction,
      index: ipn.index
    }

    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: this.generateKey(IpnDaoImpl.PK_IPN_PREFIX, ipnKey),
        sk: this.generateSecondaryKey(ipnKey),
        ipn
      })
    })
  }

  public async loadIpnResult(ipnKey: IpnKey): Promise<IpnResult | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: this.generateKey(IpnDaoImpl.PK_IPN_RESULT_PREFIX, ipnKey),
        sk: this.generateSecondaryKey(ipnKey)
      })
    })

    return result.Item ? unmarshall(result.Item).ipnResult as IpnResult : undefined
  }

  public async saveIpnResult(ipnKey: IpnKey, ipnResult: IpnResult): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: this.generateKey(IpnDaoImpl.PK_IPN_RESULT_PREFIX, ipnKey),
        sk: this.generateSecondaryKey(ipnKey),
        ipnResult
      })
    })
  }

  private generateKey(prefix: string, ipnKey: IpnKey): string {
    return generateKey(prefix, ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index)
  }

  private generateSecondaryKey(ipnKey: IpnKey): string {
    return generateKey(ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index)
  }
}
