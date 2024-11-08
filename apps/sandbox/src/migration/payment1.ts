import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'
import { queryItems } from '@repo/dao-aws/dist/src/utils/dynamo-utils'
import { AccountDaoImpl } from '@repo/dao-aws/dist/src/dao/account.dao'
import { PaymentDaoImpl } from '@repo/dao-aws/dist/src/dao/payment.dao'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

import appConfig from '@repo/common/dist/src/app-config'

import { createAppConfig } from '../app-config'
import { AccountProfile } from '@repo/dao/dist/src/interfaces/account-profile'
createAppConfig()

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const accountDao = new AccountDaoImpl(dynamoService)
const paymentDao = new PaymentDaoImpl(dynamoService)

async function listOldPaymentLogs(id: string): Promise<PaymentLog[]> {
  const request: QueryInput = {
    TableName: appConfig.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk_value',
    ExpressionAttributeValues: marshall({
      ':pk_value': `payment_log#${id}`
    })
  }

  return await queryItems<PaymentLog>(dynamoService, request, 'paymentLog')
}

async function migrationPaymentLogs(profiles: AccountProfile[]): Promise<void> {
  const paymentLogsOldTmp = await Promise.all(
    profiles.map(profile => listOldPaymentLogs(profile.id))
  )
  const paymentLogsOld = paymentLogsOldTmp.flat()
  console.log(`found ${paymentLogsOld.length} payment logs`)

  await Promise.all(
    paymentLogsOld.map(paymentLog => paymentDao.savePaymentLog(paymentLog))
  )
}

async function listOldPaymentSuccess(id: string): Promise<PaymentSuccessInfoOld[]> {
  const request: QueryInput = {
    TableName: appConfig.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk_value',
    ExpressionAttributeValues: marshall({
      ':pk_value': `payment_success#${id}`
    })
  }

  return await queryItems<PaymentLog>(dynamoService, request, 'paymentSuccessInfo')
}

async function migrationPaymentSuccesses(profiles: AccountProfile[]): Promise<void> {
  const paymentSuccessesOldTmp = await Promise.all(
    profiles.map(profile => listOldPaymentSuccess(profile.id))
  )
  const paymentSuccessesOld = paymentSuccessesOldTmp.flat()
  console.log(`found ${paymentSuccessesOld.length} payment successes`)

  // await Promise.all(
  //   paymentLogsOld.map(paymentLog => paymentDao.savePaymentLog(paymentLog))
  // )
}

async function main() {
  console.log(`start migration script payment 1`)

  const profiles = await accountDao.listAccountProfiles()
  console.log(`found ${profiles.length} account profiles`)

  // console.log(`start to migrate payment logs`)
  // await migrationPaymentLogs(profiles)

  console.log(`start to migrate payment successes`)
  await migrationPaymentSuccesses(profiles)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
