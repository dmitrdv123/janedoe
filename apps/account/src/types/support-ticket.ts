export type SupportTicketType = 'general' | 'payment'

export interface SupportAccountTicket {
  ticketType: SupportTicketType
  email: string
  from: string
  paymentId: string
  blockchain: string
  token: string
  transaction: string
  desc: string
}

export interface SupportTicketResult {
  ticketId: string
}
