import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import * as http from 'http'
import morgan from 'morgan'
import cors from 'cors'
import express from 'express'
import { pinoHttp } from 'pino-http'

import appConfig from '@repo/common/dist/src/app-config'
import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'
import { bitcoinContainer } from '@repo/bitcoin/dist/src/containers/bitcoin.container'

import { createAppConfig } from './app-config'
import { routes } from './routes'
import { logger } from './utils/logger'
import container from './containers/main.container'
import { TaskManager } from './tasks/task-manager'
import { SettingsService } from './services/settings-service'
import { PaymentTask } from './tasks/payment-task'
import { MetaService } from './services/meta-service'
import { PAYMENT_TASK_INTERVAL_SECONDS } from './constants'
import { AccountService } from './services/account-service'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'
import { NotificationService } from './services/notification-service'
import { PaymentLogService } from './services/payment-log-service'
import { CryptoService } from './services/crypto-service'

const initTaskManager = async () => {
  const taskManager = container.resolve<TaskManager>('taskManager')
  const settingsService = container.resolve<SettingsService>('settingsService')
  const metaService = container.resolve<MetaService>('metaService')

  const [appSettings, meta] = await Promise.all([
    settingsService.loadAppSettings(),
    metaService.meta()
  ])

  appSettings.paymentBlockchains.map(async paymentBlockchain => {
    const blockchain = meta.blockchains.find(item => item.name.toLocaleLowerCase() === paymentBlockchain.blockchain.toLocaleLowerCase())
    if (!blockchain) {
      logger.debug(`PaymentTask: blockchain ${paymentBlockchain} not found`)
      return
    }

    logger.debug(`PaymentTask: start to process payment logs for ${blockchain.name}`)

    const task = new PaymentTask(
      blockchain,
      container.resolve<AccountService>('accountService'),
      evmContainer.resolve<EvmService>('evmService'),
      bitcoinContainer.resolve<BitcoinBlockService>('bitcoinBlockService'),
      container.resolve<MetaService>('metaService'),
      container.resolve<NotificationService>('notificationService'),
      container.resolve<PaymentLogService>('paymentLogService'),
      container.resolve<CryptoService>('cryptoService'),
      container.resolve<SettingsService>('settingsService'),
      PAYMENT_TASK_INTERVAL_SECONDS
    )

    taskManager.add(task)
  })

  taskManager.run()
}

createAppConfig()
initTaskManager()

const app = express()

app
  .use(cors())
  .use(morgan('dev'))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(pinoHttp({ logger }))

// Mount REST on /api
app.use('/api', routes)

const server: http.Server = app.listen(appConfig.PORT, () => {
  logger.info(`Listening to port ${appConfig.PORT}`)
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error: string) => {
  logger.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})
