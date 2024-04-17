import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { AccountWithId } from '../interfaces/account-profile'

const AccountSchema = new Schema<AccountWithId>({
  _id: { type: String, required: true, trim: true },

  profile: {
    id: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true, lowercase: true, index: true },
    secret: { type: String, required: true, trim: true },
  },

  settings: {
    commonSettings: {
      email: { type: String, required: false, trim: true, lowercase: true },
      description: { type: String, required: false, trim: true },
      currency: { type: String, required: true, trim: true, lowercase: true }
    },
    notificationSettings: {
      callbackUrl: { type: String, required: false, trim: true, lowercase: true },
      secretKey: { type: String, required: false, trim: true }
    },
    apiSettings: {
      apiKey: { type: String, required: false, trim: true, index: true }
    },
    teamSettings: {
      users: [{
        accountTeamUserSettingsId: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true, lowercase: true },
        permissions: { type: Map, of: String }
      }]
    },
    paymentSettings: {
      blockchains: [{ type: String, required: true, trim: true }],
      assets: [{
        blockchain: { type: String, required: true, trim: true },
        address: { type: String, required: false, trim: true },
        symbol: { type: String, required: true, trim: true }
      }]
    }
  }
})
AccountSchema.plugin(toJSON)

export const AccountModel = mongoose.model('Account', AccountSchema)
