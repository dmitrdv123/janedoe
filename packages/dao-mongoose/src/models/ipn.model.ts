import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { IpnWithId } from '../interfaces/ipn'

const IpnSchema = new Schema<IpnWithId>({
  _id: { type: String, required: true, trim: true },

  data: {
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
    amountCurrency: { type: Number, required: false },

    blockchain: { type: String, required: true, trim: true },
    tokenAddress: { type: String, required: false, trim: true },
    tokenSymbol: { type: String, required: false, trim: true },
    tokenDecimals: { type: Number, required: false },
    tokenUsdPrice: { type: Number, required: false },

    currency: { type: String, required: false, trim: true, lowercase: true },
    currencyExchangeRate: { type: Number, required: false },
  },

  result: {
    type: {
      timestamp: { type: Number, required: true, index: true },
      status: { type: Number, required: true },
      result: { type: Object, required: true },
      error: { type: String, required: false, trim: true },
    },
    required: false
  }
})
IpnSchema.plugin(toJSON)

export const IpnModel = mongoose.model('Ipn', IpnSchema)
