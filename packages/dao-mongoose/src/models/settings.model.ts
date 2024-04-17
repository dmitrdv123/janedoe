import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'

const SettingsSchema = new Schema({
  _id: { type: String, required: true, trim: true },
  settings: { type: Object, required: true },
})
SettingsSchema.plugin(toJSON)

export const SettingsModel = mongoose.model('Settings', SettingsSchema)
