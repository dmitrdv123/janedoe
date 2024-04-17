import mongoose, { Schema } from 'mongoose'

import { toJSON } from '../utils/mongo-utils'
import { SupportTicketWithId } from '../interfaces/support-ticket'

const SupportTicketSchema = new Schema<SupportTicketWithId>({
  _id: { type: String, required: true, trim: true },

  ticketOrigin: { type: String, required: true },
  ticketType: { type: String, required: false, trim: true, lowercase: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  from: { type: String, required: false, trim: true },
  companyId: { type: String, required: false, trim: true },
  paymentId: { type: String, required: false, trim: true },
  blockchain: { type: String, required: false, trim: true },
  token: { type: String, required: false, trim: true },
  transaction: { type: String, required: false, trim: true },
  desc: { type: String, required: true, trim: true },
})
SupportTicketSchema.plugin(toJSON)

export const SupportTicketModel = mongoose.model('SupportTicket', SupportTicketSchema)
