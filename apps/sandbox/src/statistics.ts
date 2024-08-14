import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import { DynamoDB } from '@aws-sdk/client-dynamodb'

import { AccountDaoImpl } from '@repo/dao-aws/dist/src/dao/account.dao'
import { SupportDaoImpl } from '@repo/dao-aws/dist/src/dao/support.dao'
import { PaymentLogDaoImpl } from '@repo/dao-aws/dist/src/dao/payment-log.dao'
import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'

import { createAppConfig } from './app-config'
createAppConfig()

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const accountDao = new AccountDaoImpl(dynamoService)
const supportDao = new SupportDaoImpl(dynamoService)
const paymentLogDao = new PaymentLogDaoImpl(dynamoService)

async function accountStatistics() {
  const accounts = await accountDao.listAccountProfiles()
  console.log(`Statistics: found ${accounts.length} accounts`)

  await Promise.all(
    accounts.map(async account => {
      const payments = await paymentLogDao.listPaymentLogs(account.id)
      const totalAmountUsd = payments.reduce((acc, payment) => acc + (payment.amountUsd ?? 0), 0)
      console.log(`Statistics: account ${account.id} - ${payments.length} payments, total amount usd ${totalAmountUsd}`)
    })
  )
}

async function supportStatistics() {
  const tickets = await supportDao.listTickets()
  console.log(`Statistics: found ${tickets.length} tickets`)
}

async function main() {
  await accountStatistics()
  await supportStatistics()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
