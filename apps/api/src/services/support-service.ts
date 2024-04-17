import { SupportDao } from '@repo/dao/dist/src/dao/support.dao'
import { SupportTicket } from '@repo/dao/dist/src/interfaces/support-ticket'

export interface SupportService {
  createTicket(ticket: SupportTicket): Promise<string>
}

export class SupportServiceImpl implements SupportService {
  public constructor(
    private supportDao: SupportDao
  ) { }

  public async createTicket(ticket: SupportTicket): Promise<string> {
    const id = await this.supportDao.saveTicket(ticket)
    return id
  }
}
