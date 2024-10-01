import * as crypto from 'crypto'

import { SupportTicket } from '@repo/dao/dist/src/interfaces/support-ticket'
import { SupportDao } from '@repo/dao/dist/src/dao/support.dao'

import { SupportTicketModel } from '../models/support-ticket.model'

export class SupportDaoImpl implements SupportDao {
  public async saveTicket(ticket: SupportTicket): Promise<string> {
    const id = crypto.randomUUID()
    await SupportTicketModel.create({
      ...ticket,
      _id: id
    })

    return id
  }

  public async listTickets(): Promise<SupportTicket[]> {
    throw new Error('Method not implemented.')
  }
}
