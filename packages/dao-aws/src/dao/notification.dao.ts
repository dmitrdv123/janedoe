import { marshall } from '@aws-sdk/util-dynamodb'

import { NotificationDao } from '@repo/dao/dist/src/dao/notification.dao'
import { Notification, NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import appConfig from '@repo/common/dist/src/app-config'

import { DynamoService } from '../services/dynamo.service'
import { generateKey, queryItems } from '../utils/dynamo-utils'

export class NotificationDaoImpl implements NotificationDao {
  private static readonly PK_PREFIX = 'notification'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async listNotifications<T>(notificationType: NotificationType): Promise<Notification<T>[]> {
    const request = {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk_value',
      ExpressionAttributeValues: marshall({
        ':pk_value': generateKey(NotificationDaoImpl.PK_PREFIX, notificationType)
      })
    }

    return await queryItems<Notification<T>>(this.dynamoService, 'notification', request)
  }

  public async saveNotification<T>(notification: Notification<T>): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(NotificationDaoImpl.PK_PREFIX, notification.notificationType),
        sk: generateKey(notification.key.toLocaleLowerCase(), notification.timestamp),
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
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(NotificationDaoImpl.PK_PREFIX, notificationType),
        sk: generateKey(key.toLocaleLowerCase(), timestamp),
      })
    })
  }
}
