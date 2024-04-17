import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { SharedAccountWithId } from '../interfaces/shared-account'

const SharedAccountSchema = new Schema<SharedAccountWithId>({
  _id: { type: String, required: true, trim: true },

  sharedAccountId: { type: String, required: true, trim: true, index: true },
  sharedAddress: { type: String, required: true, trim: true, lowercase: true },
  shareToAddress: { type: String, required: true, trim: true, lowercase: true },
  permissions: { type: Map, of: String }
})
SharedAccountSchema.plugin(toJSON)

export const SharedAccountModel = mongoose.model('SharedAccount', SharedAccountSchema)
