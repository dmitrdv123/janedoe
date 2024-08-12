import { MetricDao } from '@repo/dao/dist/src/dao/metric.dao'
import { SupportDao } from '@repo/dao/dist/src/dao/support.dao'
import { IpnDao } from '@repo/dao/dist/src/dao/ipn.dao'
import { NotificationDao } from '@repo/dao/dist/src/dao/notification.dao'
import { MetaDao } from '@repo/dao/dist/src/dao/meta.dao'
import { ExchangeRateDao } from '@repo/dao/dist/src/dao/exchange-rate.dao'
import { PaymentLogDao } from '@repo/dao/dist/src/dao/payment-log.dao'
import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import { PaymentDao } from '@repo/dao/dist/src/dao/payment.dao'
import { AuthDao } from '@repo/dao/dist/src/dao/auth.dao'
import { SettingsDao } from '@repo/dao/dist/src/dao/settings.dao'
import { EmailTemplateDao } from '@repo/dao/dist/src/dao/email-template.dao'
import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { RangoWrapperService } from '@repo/common/dist/src/services/rango-wrapper-service'
import { BitcoinService } from '@repo/bitcoin/dist/src/services/bitcoin.service'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'
import { NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { SupportTicketWithId } from '@repo/dao/dist/src/interfaces/support-ticket'

import { Container } from '@repo/common/dist/src/containers/container'
import { daoContainer as awsContainer } from '@repo/dao-aws/dist/src/containers/dao.container'
import { bitcoinContainer } from '@repo/bitcoin/dist/src/containers/bitcoin.container'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'

import { AccountController } from '../controllers/account-controller'
import { AuthController } from '../controllers/auth-controller'
import { PaymentController } from '../controllers/payment-controller'
import { AccountService, AccountServiceImpl } from '../services/account-service'
import { AuthService, AuthServiceImpl } from '../services/auth-service'
import { PaymentService, PaymentServiceImpl } from '../services/payment-service'
import { SettingsService, SettingsServiceImpl } from '../services/settings-service'
import { TaskManager, TaskManagerImpl } from '../tasks/task-manager'
import { EmailService, EmailServiceImpl } from '../services/email-service'
import { EmailTemplateService, EmailTemplateServiceImpl } from '../services/email-template-service'
import { NotificationService, NotificationServiceImpl } from '../services/notification-service'
import { NotificationTask } from '../tasks/notification-task'
import { PaymentStatusNotificationObserver } from '../services/notifications/payment-status-notification'
import { NotificationObserver } from '../services/notifications/notification-observer'
import { PaymentLogService, PaymentLogServiceImpl } from '../services/payment-log-service'
import { CryptoService, CryptoServiceImpl } from '../services/crypto-service'
import { IpnNotificationObserver } from '../services/notifications/ipn-notification'
import { SandboxController } from '../controllers/sandbox-controller'
import { IpnService, IpnServiceImpl } from '../services/ipn-service'
import { ApiController } from '../controllers/api-controller'
import { ApiService, ApiServiceImpl } from '../services/api-service'
import { ExchangeRateApiWrapperService, ExchangeRateApiWrapperServiceImpl } from '../services/exchange-rate-api-wrapper-service'
import { ExchangeRateApiService, ExchangeRateApiServiceImpl } from '../services/exchange-rate-api-service'
import { MetaService, MetaServiceImpl } from '../services/meta-service'
import { SupportService, SupportServiceImpl } from '../services/support-service'
import { DocController } from '../controllers/doc-controller'
import { MetaTask } from '../tasks/meta-task'
import { RangoService, RangoServiceImpl } from '../services/rango-service'
import { BitcoinBlockTask } from '../tasks/bitcoin-block.task'
import { PaymentManagerTask } from '../tasks/payment-manager-task'
import { ExchangeRateTask } from '../tasks/currency-task'
import { SupportNotificationObserver } from '../services/notifications/support-notification-observer'

const container = new Container()

// Services
container.register('emailService', new EmailServiceImpl())
container.register(
  'emailTemplateService',
  new EmailTemplateServiceImpl(
    awsContainer.resolve<EmailTemplateDao>('emailTemplateDao')
  )
)
container.register(
  'settingsService',
  new SettingsServiceImpl(
    commonContainer.resolve<CacheService>('cacheService'),
    awsContainer.resolve<SettingsDao>('settingsDao')
  )
)
container.register(
  'rangoService',
  new RangoServiceImpl(
    commonContainer.resolve<RangoWrapperService>('rangoWrapperService'),
    commonContainer.resolve<CacheService>('cacheService'),
    awsContainer.resolve<MetricDao>('metricDao')
  )
)
container.register('exchangeRateApiWrapperService', new ExchangeRateApiWrapperServiceImpl(commonContainer.resolve<CacheService>('cacheService')))
container.register('cryptoService', new CryptoServiceImpl())
container.register(
  'ipnService',
  new IpnServiceImpl(
    awsContainer.resolve<IpnDao>('ipnDao')
  )
)
container.register(
  'notificationService',
  new NotificationServiceImpl(
    awsContainer.resolve<NotificationDao>('notificationDao')
  )
)
container.register(
  'supportService', new SupportServiceImpl(
    container.resolve<NotificationService>('notificationService'),
    awsContainer.resolve<SupportDao>('supportDao')
  )
)
container.register(
  'metaService',
  new MetaServiceImpl(
    container.resolve<RangoService>('rangoService'),
    awsContainer.resolve<MetaDao>('metaDao')
  )
)
container.register(
  'exchangeRateApiService',
  new ExchangeRateApiServiceImpl(
    container.resolve<ExchangeRateApiWrapperService>('exchangeRateApiWrapperService'),
    awsContainer.resolve<ExchangeRateDao>('exchangeRateDao')
  )
)
container.register('paymentLogService', new PaymentLogServiceImpl(
  awsContainer.resolve<PaymentLogDao>('paymentLogDao'))
)
container.register(
  'accountService',
  new AccountServiceImpl(
    container.resolve<SettingsService>('settingsService'),
    bitcoinContainer.resolve<BitcoinService>('bitcoinService'),
    container.resolve<CryptoService>('cryptoService'),
    container.resolve<IpnService>('ipnService'),
    container.resolve<PaymentLogService>('paymentLogService'),
    container.resolve<ExchangeRateApiService>('exchangeRateApiService'),
    container.resolve<MetaService>('metaService'),
    awsContainer.resolve<AccountDao>('accountDao')
  )
)
container.register(
  'paymentService',
  new PaymentServiceImpl(
    container.resolve<AccountService>('accountService'),
    bitcoinContainer.resolve<BitcoinService>('bitcoinService'),
    container.resolve<PaymentLogService>('paymentLogService'),
    awsContainer.resolve<PaymentDao>('paymentDao')
  )
)
container.register(
  'authService',
  new AuthServiceImpl(
    container.resolve<AccountService>('accountService'),
    awsContainer.resolve<AuthDao>('authDao')
  )
)
container.register('apiService',
  new ApiServiceImpl(
    container.resolve<SettingsService>('settingsService'),
    container.resolve<AccountService>('accountService'),
    container.resolve<IpnService>('ipnService'),
    container.resolve<PaymentLogService>('paymentLogService'),
    container.resolve<ExchangeRateApiService>('exchangeRateApiService'),
    container.resolve<MetaService>('metaService')
  )
)

// Controllers
container.register('sandboxController', new SandboxController())
container.register(
  'accountController',
  new AccountController(
    container.resolve<SettingsService>('settingsService'),
    container.resolve<MetaService>('metaService'),
    container.resolve<AccountService>('accountService'),
    container.resolve<ExchangeRateApiService>('exchangeRateApiService'),
    container.resolve<SupportService>('supportService')
  )
)
container.register(
  'authController',
  new AuthController(
    container.resolve<AuthService>('authService')
  )
)
container.register(
  'paymentController',
  new PaymentController(
    container.resolve<SettingsService>('settingsService'),
    container.resolve<MetaService>('metaService'),
    container.resolve<PaymentService>('paymentService'),
    container.resolve<RangoService>('rangoService'),
    container.resolve<ExchangeRateApiService>('exchangeRateApiService'),
    container.resolve<SupportService>('supportService')
  )
)
container.register(
  'apiController',
  new ApiController(
    container.resolve<ApiService>('apiService')
  )
)
container.register(
  'docController',
  new DocController(
    container.resolve<SettingsService>('settingsService'),
    container.resolve<MetaService>('metaService')
  )
)

// Observers
container.register(
  'paymentStatusNotificationObserver',
  new PaymentStatusNotificationObserver(
    container.resolve<PaymentService>('paymentService'),
    container.resolve<EmailService>('emailService'),
    container.resolve<EmailTemplateService>('emailTemplateService')
  )
)
container.register(
  'ipnNotificationObserver',
  new IpnNotificationObserver(
    container.resolve<AccountService>('accountService'),
    container.resolve<PaymentService>('paymentService'),
    container.resolve<IpnService>('ipnService'),
    container.resolve<ExchangeRateApiService>('exchangeRateApiService')
  )
)
container.register(
  'supportNotificationObserver',
  new SupportNotificationObserver(
    container.resolve<EmailService>('emailService'),
    container.resolve<EmailTemplateService>('emailTemplateService')
  )
)

// Tasks
container.register('taskManager', new TaskManagerImpl())

container.register(
  'bitcoinBlockTask',
  new BitcoinBlockTask(
    bitcoinContainer.resolve<BitcoinBlockService>('bitcoinBlockService')
  )
)
container.register(
  'ipnNotificationTask',
  new NotificationTask<PaymentLog>(
    NotificationType.IPN,
    container.resolve<NotificationObserver>('ipnNotificationObserver'),
    container.resolve<NotificationService>('notificationService')
  )
)
container.register(
  'paymentStatusNotificationTask',
  new NotificationTask<PaymentLog>(
    NotificationType.PAYMENT,
    container.resolve<NotificationObserver>('paymentStatusNotificationObserver'),
    container.resolve<NotificationService>('notificationService')
  )
)
container.register(
  'supportNotificationTask',
  new NotificationTask<SupportTicketWithId>(
    NotificationType.SUPPORT,
    container.resolve<NotificationObserver>('supportNotificationObserver'),
    container.resolve<NotificationService>('notificationService')
  )
)
container.register(
  'metaTask',
  new MetaTask(
    container.resolve<MetaService>('metaService'),
    container.resolve<SettingsService>('settingsService')
  )
)
container.register(
  'exchangeRateTask',
  new ExchangeRateTask(
    container.resolve<ExchangeRateApiService>('exchangeRateApiService'),
    container.resolve<ExchangeRateApiWrapperService>('exchangeRateApiWrapperService'),
    container.resolve<SettingsService>('settingsService')
  )
)
container.register(
  'paymentManagerTask',
  new PaymentManagerTask(
    container.resolve<TaskManager>('taskManager'),
    container.resolve<SettingsService>('settingsService'),
    container.resolve<MetaService>('metaService'),
    container.resolve<AccountService>('accountService'),
    evmContainer.resolve<EvmService>('evmService'),
    bitcoinContainer.resolve<BitcoinBlockService>('bitcoinBlockService'),
    container.resolve<NotificationService>('notificationService'),
    container.resolve<PaymentLogService>('paymentLogService'),
    container.resolve<CryptoService>('cryptoService')
  )
)

export default container
