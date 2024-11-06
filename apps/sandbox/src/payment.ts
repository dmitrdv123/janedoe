import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import { DynamoDB } from '@aws-sdk/client-dynamodb'

import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'
import { PaymentDaoImpl } from '@repo/dao-aws/dist/src/dao/payment.dao'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

import { createAppConfig } from './app-config'
import { PaymentSuccess } from '@repo/dao/dist/src/interfaces/payment-success'

createAppConfig()

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const paymentDao = new PaymentDaoImpl(dynamoService)

async function main() {
  const paymentLog: PaymentLog = {
    accountId: 'accountId1',
    paymentId: 'paymentId1',

    block: 'block1',
    timestamp: 1,
    transaction: 'transaction1',
    index: 0,

    from: 'from1',
    to: 'to1',
    direction: 'incoming',

    amount: '1',
    amountUsd: null,

    blockchain: 'hardhat',
    tokenAddress: null,
    tokenSymbol: null,
    tokenDecimals: null,
    tokenUsdPrice: null
  }

  console.log(`debug >> start to save payment log`)
  await paymentDao.savePaymentLog(paymentLog)
  console.log(`debug >> end to save payment log`)

  console.log(`debug >> start to list payment history`)
  const paymentHistory = await paymentDao.listPaymentHistory('accountId1', { direction: 'incoming' })
  console.log(`debug >> end to list payment history`)
  console.log(JSON.stringify(paymentHistory))

  const paymentSuccess: PaymentSuccess = {
    accountId: 'accountId1',
    paymentId: 'paymentId1',
    timestamp: 1,
    blockchain: 'hardhat',
    transaction: 'transaction1',
    index: 0,
    email: 'mail@mail.com',
    language: 'en',
    currency: 'usd',
    amountCurrency: 1,
    description: null,
    comment: 'Refund for 124',
  }

  console.log(`debug >> start to save payment success`)
  await paymentDao.savePaymentSuccess(paymentSuccess)
  console.log(`debug >> end to save payment success`)

  console.log(`debug >> start to list payment history`)
  const listPaymentHistory2 = await paymentDao.listPaymentHistory('accountId1', { comment: 'refund' })
  console.log(`debug >> end to list payment history`)
  console.log(JSON.stringify(listPaymentHistory2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
