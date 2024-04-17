import { Container } from '@repo/common/dist/src/containers/container'

import { AccountDaoImpl } from '../dao/account.dao'
import { AuthDaoImpl } from '../dao/auth-service'
import { ExchangeRateDaoImpl } from '../dao/exchange-rate.dao'
import { IpnDaoImpl } from '../dao/ipn.dao'
import { MetaDaoImpl } from '../dao/meta.dao'
import { NotificationDaoImpl } from '../dao/notification.dao'
import { PaymentLogDaoImpl } from '../dao/payment-log.dao'
import { PaymentDaoImpl } from '../dao/payment.dao'
import { SettingsDaoImpl } from '../dao/settings.dao'
import { SupportDaoImpl } from '../dao/support.dao'

export const daoContainer = new Container()

// DAO
daoContainer.register('accountDao', new AccountDaoImpl())
daoContainer.register('authDao', new AuthDaoImpl())
daoContainer.register('settingsDao', new SettingsDaoImpl())
daoContainer.register('exchangeRateDao', new ExchangeRateDaoImpl())
daoContainer.register('ipnDao', new IpnDaoImpl())
daoContainer.register('metaDao', new MetaDaoImpl())
daoContainer.register('notificationDao', new NotificationDaoImpl())
daoContainer.register('paymentLogDao', new PaymentLogDaoImpl())
daoContainer.register('paymentDao', new PaymentDaoImpl())
daoContainer.register('supportDao', new SupportDaoImpl())
