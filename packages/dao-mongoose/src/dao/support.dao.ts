import * as crypto from 'crypto'

import { SupportTicket } from '@repo/dao/src/interfaces/support-ticket'
import { SupportDao } from '@repo/dao/src/dao/support.dao'

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
}
