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
import { BitcoinService } from '@repo/common/dist/src/services/bitcoin-service'

import { Container } from '@repo/common/dist/src/containers/container'
import { daoContainer as awsContainer } from '@repo/dao-aws/dist/src/containers/dao.container'
import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'

import { AccountController } from '../controllers/account-controller'
import { AuthController } from '../controllers/auth-controller'
import { PaymentController } from '../controllers/payment-controller'
import { AccountService, AccountServiceImpl } from '../services/account-service'
import { AuthService, AuthServiceImpl } from '../services/auth-service'
import { RangoWrapperService, RangoWrapperServiceImpl } from '../services/rango-wrapper-service'
import { PaymentService, PaymentServiceImpl } from '../services/payment-service'
import { SettingsService, SettingsServiceImpl } from '../services/settings-service'
import { META_TASK_INTERVAL_SECONDS, NOTIFICATION_TASK_INTERVAL_SECONDS, PAYMENT_TASK_INTERVAL_SECONDS } from '../constants'
import { Task, TaskManagerImpl } from '../tasks/task-manager'
import { PaymentTask } from '../tasks/payment-task'
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

const container = new Container()

// Services
container.register(
  'supportService', new SupportServiceImpl(
    awsContainer.resolve<SupportDao>('supportDao')
  )
)
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
    awsContainer.resolve<SettingsDao>('settingsDao')
  )
)
container.register('rangoWrapperService', new RangoWrapperServiceImpl(commonContainer.resolve<CacheService>('cacheService')))
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
  'metaService',
  new MetaServiceImpl(
    container.resolve<RangoWrapperService>('rangoWrapperService'),
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
    commonContainer.resolve<BitcoinService>('bitcoinService'),
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
    commonContainer.resolve<BitcoinService>('bitcoinService'),
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
    container.resolve<RangoWrapperService>('rangoWrapperService'),
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
    container.resolve<IpnService>('ipnService'),
    container.resolve<ExchangeRateApiService>('exchangeRateApiService')
  )
)

// Tasks
container.register(
  'paymentTask',
  new PaymentTask(
    container.resolve<AccountService>('accountService'),
    evmContainer.resolve<EvmService>('evmService'),
    commonContainer.resolve<BitcoinService>('bitcoinService'),
    container.resolve<MetaService>('metaService'),
    container.resolve<NotificationService>('notificationService'),
    container.resolve<PaymentLogService>('paymentLogService'),
    container.resolve<CryptoService>('cryptoService'),
    container.resolve<SettingsService>('settingsService'),
    PAYMENT_TASK_INTERVAL_SECONDS
  )
)
container.register(
  'notificationTask',
  new NotificationTask(
    {
      'payment': container.resolve<NotificationObserver>('paymentStatusNotificationObserver'),
      'ipn': container.resolve<NotificationObserver>('ipnNotificationObserver')
    },
    container.resolve<NotificationService>('notificationService'),
    NOTIFICATION_TASK_INTERVAL_SECONDS
  )
)
container.register(
  'metaTask',
  new MetaTask(
    container.resolve<MetaService>('metaService'),
    container.resolve<SettingsService>('settingsService'),
    META_TASK_INTERVAL_SECONDS
  )
)
container.register(
  'taskManager',
  new TaskManagerImpl(
    container.resolve<Task>('paymentTask'),
    container.resolve<Task>('notificationTask'),
    container.resolve<Task>('metaTask')
  )
)

export default container
