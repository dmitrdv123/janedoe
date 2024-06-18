import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { S3 } from '@aws-sdk/client-s3'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { CloudWatch } from '@aws-sdk/client-cloudwatch'

import { Container } from '@repo/common/dist/src/containers/container'

import { DynamoService, DynamoServiceImpl } from '../services/dynamo.service'
import { AccountDaoImpl } from '../dao/account.dao'
import { AuthDaoImpl } from '../dao/auth.dao'
import { SettingsDaoImpl } from '../dao/settings.dao'
import { ExchangeRateDaoImpl } from '../dao/exchange-rate.dao'
import { IpnDaoImpl } from '../dao/ipn.dao'
import { MetaDaoImpl } from '../dao/meta.dao'
import { NotificationDaoImpl } from '../dao/notification.dao'
import { PaymentLogDaoImpl } from '../dao/payment-log.dao'
import { PaymentDaoImpl } from '../dao/payment.dao'
import { SupportDaoImpl } from '../dao/support.dao'
import { S3Service, S3ServiceImpl } from '../services/s3.service'
import { EmailTemplateDaoImpl } from '../dao/email-template.dao'
import { SecretService, SecretServiceImpl } from '../services/secret.service'
import { SecretDaoImpl } from '../dao/secret.dao'
import { CloudwatchService, CloudwatchServiceImpl } from '../services/cloudwatch.service'
import { MetricDaoImpl } from '../dao/metric.dao'
import { BitcoinDaoImpl } from '../dao/bitcoin.dao'

export const daoContainer = new Container()

// Services
daoContainer.register('cloudwatchService', new CloudwatchServiceImpl(new CloudWatch()))
daoContainer.register('dynamoService', new DynamoServiceImpl(new DynamoDB()))
daoContainer.register('s3Service', new S3ServiceImpl(new S3()))
daoContainer.register('secretService', new SecretServiceImpl(new SecretsManagerClient()))

// DAO
daoContainer.register(
  'metricDao',
  new MetricDaoImpl(
    daoContainer.resolve<CloudwatchService>('cloudwatchService')
  )
)

daoContainer.register(
  'accountDao',
  new AccountDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'authDao',
  new AuthDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'settingsDao',
  new SettingsDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'secretDao',
  new SecretDaoImpl(
    daoContainer.resolve<SecretService>('secretService')
  )
)
daoContainer.register(
  'exchangeRateDao',
  new ExchangeRateDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'ipnDao',
  new IpnDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'metaDao',
  new MetaDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'notificationDao',
  new NotificationDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'paymentLogDao',
  new PaymentLogDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'paymentDao',
  new PaymentDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'supportDao',
  new SupportDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'bitcoinDao',
  new BitcoinDaoImpl(
    daoContainer.resolve<DynamoService>('dynamoService')
  )
)
daoContainer.register(
  'emailTemplateDao',
  new EmailTemplateDaoImpl(
    daoContainer.resolve<S3Service>('s3Service')
  )
)
