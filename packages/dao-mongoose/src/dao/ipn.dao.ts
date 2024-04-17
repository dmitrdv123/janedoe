import { IpnDao } from '@repo/dao/src/dao/ipn.dao'
import { IpnData, IpnKey, IpnResult } from '@repo/dao/src/interfaces/ipn'

import { IpnModel } from '../models/ipn.model'

export class IpnDaoImpl implements IpnDao {
  public async loadIpnData(ipnKey: IpnKey): Promise<IpnData | undefined> {
    const ipn = await IpnModel
      .findById(
        [ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index].join(':')
      )
      .select('data')
    return ipn?.data
  }

  public async saveIpnData(ipn: IpnData): Promise<void> {
    await IpnModel.updateOne(
      { _id: [ipn.accountId, ipn.paymentId, ipn.blockchain.toLocaleLowerCase(), ipn.transaction, ipn.index].join(':') },
      { data: ipn },
      { upsert: true }
    )
  }

  public async loadIpnResult(ipnKey: IpnKey): Promise<IpnResult | undefined> {
    const ipn = await IpnModel
      .findById(
        [ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index].join(':')
      )
      .select('result')
    return ipn?.result ?? undefined
  }

  public async saveIpnResult(ipnKey: IpnKey, ipnResult: IpnResult): Promise<void> {
    await IpnModel.updateOne(
      { _id: [ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index].join(':') },
      { result: ipnResult },
      { upsert: true }
    )
  }
}
