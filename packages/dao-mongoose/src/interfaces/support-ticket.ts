import { SupportTicket } from '@repo/dao/dist/src/interfaces/support-ticket'

export interface SupportTicketWithId extends SupportTicket {
  _id: string
}
