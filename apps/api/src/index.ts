import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import * as http from 'http'
import cors from 'cors'
import express from 'express'

import appConfig from '@repo/common/dist/src/app-config'

import { createAppConfig } from './app-config'
import { routes } from './routes'
import { logger } from './utils/logger'
import container from './containers/main.container'
import { Task, TaskManager } from './tasks/task-manager'
import { BITCOIN_BLOCK_TASK_INTERVAL_SECONDS, EXCHANGE_RATE_TASK_INTERVAL_SECONDS, META_TASK_INTERVAL_SECONDS, NOTIFICATION_TASK_INTERVAL_SECONDS, PAYMENT_MANAGER_TASK_INTERVAL_SECONDS } from './constants'

createAppConfig()

const taskManager = container.resolve<TaskManager>('taskManager')
taskManager.add('bitcoinBlockTask', container.resolve<Task>('bitcoinBlockTask'), BITCOIN_BLOCK_TASK_INTERVAL_SECONDS)
taskManager.add('ipnNotificationTask', container.resolve<Task>('ipnNotificationTask'), NOTIFICATION_TASK_INTERVAL_SECONDS)
taskManager.add('paymentStatusNotificationTask', container.resolve<Task>('paymentStatusNotificationTask'), NOTIFICATION_TASK_INTERVAL_SECONDS)
taskManager.add('metaTask', container.resolve<Task>('metaTask'), META_TASK_INTERVAL_SECONDS)
taskManager.add('exchangeRateTask', container.resolve<Task>('exchangeRateTask'), EXCHANGE_RATE_TASK_INTERVAL_SECONDS)
taskManager.add('paymentManagerTask', container.resolve<Task>('paymentManagerTask'), PAYMENT_MANAGER_TASK_INTERVAL_SECONDS)

const app = express()

app
  .use(cors())
  .use(express.urlencoded({ extended: true }))
  .use(express.json())

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
