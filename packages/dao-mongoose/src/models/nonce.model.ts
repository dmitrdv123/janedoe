import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { NonceWithId } from '../interfaces/nonce'

const NonceSchema = new Schema<NonceWithId>({
  _id: { type: String, required: true, trim: true },

  nonce: { type: String, required: true, trim: true },
  nonceId: { type: String, required: true, trim: true },
  wallet: { type: String, required: false, trim: true, lowercase: true }
})
NonceSchema.plugin(toJSON)

export const NonceModel = mongoose.model('Nonce', NonceSchema)
