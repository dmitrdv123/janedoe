import { PaymentLog } from '@repo/dao/src/interfaces/payment-log'
import { PaymentFilter } from '@repo/dao/src/interfaces/payment-filter'
import { PaymentLogDao } from '@repo/dao/src/dao/payment-log.dao'

import { PaymentLogModel } from '../models/payment-log.model'

export class PaymentLogDaoImpl implements PaymentLogDao {
  public async savePaymentLog(paymentLog: PaymentLog): Promise<void> {
    await PaymentLogModel.updateOne(
      {
        _id: [paymentLog.accountId, paymentLog.paymentId, paymentLog.blockchain.toLocaleLowerCase(), paymentLog.transaction, paymentLog.index, paymentLog.timestamp].join(':')
      },
      paymentLog,
      { upsert: true }
    )
  }

  public async listPaymentLogs(id: string, filter?: PaymentFilter): Promise<PaymentLog[]> {
    let query = PaymentLogModel
      .find()
      .where(
        {
          _id: {
            $regex: '^' + id + ':' + (filter?.paymentId ? filter.paymentId + ':' : '')
          }
        }
      )

    if (filter?.timestampFrom) {
      query = query.where({ timestamp: { $gte: filter.timestampFrom } })
    }

    if (filter?.timestampTo) {
      query = query.where({ timestamp: { $lte: filter.timestampTo } })
    }

    if (filter?.transaction) {
      query = query.where({ transaction: { $regex: new RegExp('^' + filter.transaction, 'i') } })
    }

    if (filter?.blockchains && filter.blockchains.length > 0) {
      query = query.where({ blockchain: { $in: filter.blockchains.map(item => new RegExp('^' + item + '$', 'i')) } })
    }

    if (filter?.from) {
      query = query.where({ from: { $regex: new RegExp('^' + filter.from, 'i') } })
    }

    if (filter?.to) {
      query = query.where({ to: { $regex: new RegExp('^' + filter.to, 'i') } })
    }

    query = query.sort({ timestamp: 'desc', blockchain: 'asc', transaction: 'asc', index: 'desc' })

    const result = await query.exec()
    return result.map(item => item.toJSON())
  }
}
