export type SupportTicketOrigin = 'account' | 'payment'

export interface SupportTicket {
  ticketOrigin: SupportTicketOrigin
  ticketType: string
  email: string
  from: string
  companyId: string
  paymentId: string
  blockchain: string
  token: string
  transaction: string
  desc: string
}
