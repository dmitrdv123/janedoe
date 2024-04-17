import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { ExchangeRateWithId } from '../interfaces/exchange-rate'

const ExchangeRateSchema = new Schema<ExchangeRateWithId>({
  _id: { type: String, required: true, trim: true },

  currency: { type: String, required: true, trim: true, lowercase: true },
  timestamp: { type: Number, required: true },
  usdPrice: { type: Number, required: true }
})
ExchangeRateSchema.plugin(toJSON)

export const ExchangeRateModel = mongoose.model('ExchangeRate', ExchangeRateSchema)
