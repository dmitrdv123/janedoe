import { SupportTicket } from '@repo/dao/src/interfaces/support-ticket'

export interface SupportTicketWithId extends SupportTicket {
  _id: string
}
