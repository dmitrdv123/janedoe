import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'

const NotificationSchema = new Schema({
  _id: { type: String, required: true, trim: true },

  key: { type: String, required: true, trim: true, lowercase: true },
  notificationType: { type: String, required: true },
  timestamp: { type: Number, required: true },
  data: { type: Object, required: true },
})
NotificationSchema.plugin(toJSON)

export const NotificationModel = mongoose.model('Notification', NotificationSchema)
