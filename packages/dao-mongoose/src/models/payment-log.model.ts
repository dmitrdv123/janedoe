import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { PaymentLogWithId } from '../interfaces/payment-log'

const PaymentLogSchema = new Schema<PaymentLogWithId>({
  _id: { type: String, required: true, trim: true },

  accountId: { type: String, required: true, trim: true },
  paymentId: { type: String, required: true, trim: true },

  block: { type: String, required: true, trim: true },
  timestamp: { type: Number, required: true, index: true },
  transaction: { type: String, required: true, trim: true },
  index: { type: Number, required: true },

  from: { type: String, required: false, trim: true, lowercase: true },
  to: { type: String, required: true, trim: true, lowercase: true },
  amount: { type: String, required: true, trim: true },
  amountUsd: { type: Number, required: false },

  blockchain: { type: String, required: true, trim: true },
  tokenAddress: { type: String, required: false, trim: true },
  tokenSymbol: { type: String, required: false, trim: true },
  tokenDecimals: { type: Number, required: false },
  tokenUsdPrice: { type: Number, required: false }
})
PaymentLogSchema.plugin(toJSON)

export const PaymentLogModel = mongoose.model('PaymentLog', PaymentLogSchema)
