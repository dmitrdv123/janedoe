import { SupportDao } from '@repo/dao/dist/src/dao/support.dao'
import { SupportTicket, SupportTicketWithId } from '@repo/dao/dist/src/interfaces/support-ticket'
import { NotificationType } from '@repo/dao/dist/src/interfaces/notification'

import { NotificationService } from './notification-service'

export interface SupportService {
  createTicket(ticket: SupportTicket): Promise<string>
}

export class SupportServiceImpl implements SupportService {
  public constructor(
    private notificationService: NotificationService,
    private supportDao: SupportDao
  ) { }

  public async createTicket(ticket: SupportTicket): Promise<string> {
    const id = await this.supportDao.saveTicket(ticket)

    const now = Math.floor(Date.now() / 1000)
    const data: SupportTicketWithId = {
      ...ticket, id
    }

    await this.notificationService.createNotification(id, NotificationType.SUPPORT, now, data)

    return id
  }
}
