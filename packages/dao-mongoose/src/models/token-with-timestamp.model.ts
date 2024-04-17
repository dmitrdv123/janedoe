import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { TokensWithTimestampWithId } from '../interfaces/token'

const TokenWithTimestampSchema = new Schema<TokensWithTimestampWithId>({
  _id: { type: String, required: true, trim: true },

  tokens: [{
    blockchain: { type: String, required: true, trim: true },
    chainId: { type: String, required: false, trim: true },
    symbol: { type: String, required: true, trim: true },
    address: { type: String, required: false, trim: true },
    name: { type: String, required: true, trim: true },
    decimals: { type: Number, required: true },
    image: { type: String, required: true, trim: true },
    blockchainImage: { type: String, required: true, trim: true },
    usdPrice: { type: Number, required: false },
    isPopular: { type: Boolean, required: true }
  }],

  timestamp: { type: Number, required: true }
})
TokenWithTimestampSchema.plugin(toJSON)

export const TokenWithTimestampModel = mongoose.model('TokenWithTimestamp', TokenWithTimestampSchema)
