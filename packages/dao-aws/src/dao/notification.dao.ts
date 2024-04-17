import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { NotificationDao } from '@repo/dao/dist/src/dao/notification.dao'
import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey } from '../utils/dynamo-utils'

export class NotificationDaoImpl implements NotificationDao {
  private static readonly PK_PREFIX = 'notification'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async listNotifications<T>(): Promise<Notification<T>[]> {
    const result = await this.dynamoService.scanItems({
      TableName: appConfig.TABLE_NAME_NOTIFICATION,
      FilterExpression: 'begins_with(pk, :pk_prefix)',
      ExpressionAttributeValues: marshall({
        ':pk_prefix': `${NotificationDaoImpl.PK_PREFIX}#`
      })
    })

    const notifications = result.Items
      ? result.Items
        .map(item => {
          if (!item.notification) {
            return undefined
          }

          const notification = unmarshall(item).notification
          return {
            key: notification.key,
            notificationType: notification.notificationType as NotificationType,
            timestamp: notification.timestamp,
            data: notification.data as T
          } as Notification<T>
        })
        .filter(item => !!item) as Notification<T>[]
      : []

    return notifications
  }

  public async saveNotification<T>(notification: Notification<T>): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME_NOTIFICATION,
      Item: marshall({
        pk: generateKey(NotificationDaoImpl.PK_PREFIX, notification.notificationType, notification.key.toLocaleLowerCase()),
        sk: notification.timestamp,
        notification: {
          key: notification.key,
          notificationType: notification.notificationType.toString(),
          timestamp: notification.timestamp,
          data: notification.data as T
        }
      })
    })
  }

  public async deleteNotification(key: string, notificationType: NotificationType, timestamp: number): Promise<void> {
    await this.dynamoService.deleteItem({
      TableName: appConfig.TABLE_NAME_NOTIFICATION,
      Key: marshall({
        pk: generateKey(NotificationDaoImpl.PK_PREFIX, notificationType, key.toLocaleLowerCase()),
        sk: timestamp
      })
    })
  }
}
