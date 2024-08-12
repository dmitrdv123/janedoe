import { SupportTicket } from '../interfaces/support-ticket'

export interface SupportDao {
  saveTicket(ticket: SupportTicket): Promise<string>
  listTickets(): Promise<SupportTicket[]>
}
