import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { PaymentSuccessInfoWithId } from '../interfaces/payment-success-info'

const PaymentSuccessInfoSchema = new Schema<PaymentSuccessInfoWithId>({
  _id: { type: String, required: true, trim: true },

  timestamp: { type: Number, required: true },
  blockchain: { type: String, required: true, trim: true },
  txid: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: false, trim: true },
  comment: { type: String, required: false, trim: true },
  language: { type: String, required: true, trim: true, lowercase: true },
})
PaymentSuccessInfoSchema.plugin(toJSON)

export const PaymentSuccessInfoModel = mongoose.model('PaymentSuccessInfo', PaymentSuccessInfoSchema)
