import { PaymentSuccessInfo } from '@repo/dao/dist/src/interfaces/payment-success-info'
import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'

import { PaymentSuccessInfoModel } from '../models/payment-success-info.model'

export class PaymentDaoImpl implements PaymentDao {
  public async saveSuccess(accountId: string, paymentId: string, paymentSuccessInfo: PaymentSuccessInfo): Promise<void> {
    await PaymentSuccessInfoModel.updateOne(
      {
        _id: [accountId, paymentId].join(':')
      },
      paymentSuccessInfo,
      {
        upsert: true
      }
    )
  }

  public async loadSuccess(accountId: string, paymentId: string): Promise<PaymentSuccessInfo | undefined> {
    const result = await PaymentSuccessInfoModel.findById(
      [accountId, paymentId].join(':')
    )
    return result?.toJSON()
  }

  public async deleteSuccess(accountId: string, paymentId: string): Promise<void> {
    await PaymentSuccessInfoModel.deleteOne({
      _id: [accountId, paymentId].join(':')
    })
  }
}
