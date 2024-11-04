import { PaymentSuccessInfo } from '@repo/dao/dist/src/interfaces/payment-success-info'
import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'

import { PaymentSuccessInfoModel } from '../models/payment-success-info.model'

export class PaymentDaoImpl implements PaymentDao {
  public async saveSuccess(accountId: string, blockchain: string, txid: string, paymentSuccessInfo: PaymentSuccessInfo): Promise<void> {
    await PaymentSuccessInfoModel.updateOne(
      {
        _id: [accountId, blockchain, txid].join(':')
      },
      paymentSuccessInfo,
      {
        upsert: true
      }
    )
  }

  public async loadSuccess(accountId: string, blockchain: string, txid: string): Promise<PaymentSuccessInfo | undefined> {
    const result = await PaymentSuccessInfoModel.findById(
      [accountId, blockchain, txid].join(':')
    )
    return result?.toJSON()
  }

  public async listSuccess(accountId: string, comment?: string | undefined): Promise<PaymentSuccessInfo[]> {
    throw new Error('Method not implemented.')
  }
}
