import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { PaymentSuccessWithId } from '../interfaces/payment-success'

const PaymentSuccessSchema = new Schema<PaymentSuccessWithId>({
  _id: { type: String, required: true, trim: true },

  timestamp: { type: Number, required: true },
  blockchain: { type: String, required: true, trim: true },
  transaction: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: false, trim: true },
  comment: { type: String, required: false, trim: true },
  language: { type: String, required: true, trim: true, lowercase: true },
})
PaymentSuccessSchema.plugin(toJSON)

export const PaymentSuccessModel = mongoose.model('PaymentSuccess', PaymentSuccessSchema)
