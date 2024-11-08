import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'
import { queryItems, generateKey } from '@repo/dao-aws/dist/src/utils/dynamo-utils'
import { AccountDaoImpl } from '@repo/dao-aws/dist/src/dao/account.dao'
import { PaymentDaoImpl } from '@repo/dao-aws/dist/src/dao/payment.dao'
import { IpnDaoImpl } from '@repo/dao-aws/dist/src/dao/ipn.dao'
import { PaymentLog, PaymentLogDirection } from '@repo/dao/dist/src/interfaces/payment-log'
import { AccountProfile } from '@repo/dao/dist/src/interfaces/account-profile'
import { PaymentSuccess } from '@repo/dao/dist/src/interfaces/payment-success'
import { IpnData, IpnKey, IpnResult } from '@repo/dao/dist/src/interfaces/ipn'
import appConfig from '@repo/common/dist/src/app-config'

import { createAppConfig } from '../app-config'
createAppConfig()

export interface PaymentLogOld {
  accountId: string
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: PaymentLogDirection | null | undefined

  amount: string
  amountUsd: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  tokenUsdPrice: number | null
}

export interface PaymentSuccessInfoOld {
  timestamp: number
  blockchain: string
  email: string
  currency: string
  amountCurrency: number
  description: string | null
  language: string
}

export interface IpnDataOld {
  accountId: string
  paymentId: string

  block: string
  timestamp: number
  transaction: string
  index: number

  from: string | null
  to: string
  direction: PaymentLogDirection | null | undefined

  amount: string
  amountUsd: number | null
  amountCurrency: number | null

  totalAmountUsd: number | null
  totalAmountCurrency: number | null

  blockchain: string
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  tokenUsdPrice: number | null

  currency: string | null
  currencyExchangeRate: number | null
}

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const accountDao = new AccountDaoImpl(dynamoService)
const paymentDao = new PaymentDaoImpl(dynamoService)
const ipnDao = new IpnDaoImpl(dynamoService)

async function listOldPaymentLogs(id: string): Promise<PaymentLogOld[]> {
  const request: QueryInput = {
    TableName: appConfig.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk_value',
    ExpressionAttributeValues: marshall({
      ':pk_value': `payment_log#${id}`
    })
  }

  return await queryItems<PaymentLog>(dynamoService, request, 'paymentLog')
}

async function migrationPaymentLogs(profiles: AccountProfile[]): Promise<PaymentLog[]> {
  const paymentLogsOld = await Promise.all(
    profiles.map(profile => listOldPaymentLogs(profile.id))
  )
  const paymentLogs = paymentLogsOld.flat().map(paymentLogOld => {
    const paymentLog: PaymentLog = {
      accountId: paymentLogOld.accountId,
      paymentId: paymentLogOld.paymentId,

      block: paymentLogOld.block,
      timestamp: paymentLogOld.timestamp,
      transaction: paymentLogOld.transaction,
      index: paymentLogOld.index,

      from: paymentLogOld.from,
      to: paymentLogOld.to,
      direction: paymentLogOld.direction ?? 'incoming',

      amount: paymentLogOld.amount,
      amountUsd: paymentLogOld.amountUsd,

      blockchain: paymentLogOld.blockchain,
      tokenAddress: paymentLogOld.tokenAddress,
      tokenSymbol: paymentLogOld.tokenSymbol,
      tokenDecimals: paymentLogOld.tokenDecimals,
      tokenUsdPrice: paymentLogOld.tokenUsdPrice
    }

    return paymentLog
  })
  console.log(`found ${paymentLogs.length} payment logs`)

  // await Promise.all(
  //   paymentLogs.map(paymentLog => paymentDao.savePaymentLog(paymentLog))
  // )

  return paymentLogs
}

async function loadPaymentSuccessOld(accountId: string, paymentId: string): Promise<PaymentSuccessInfoOld | undefined> {
  const result = await dynamoService.readItem({
    TableName: appConfig.TABLE_NAME,
    Key: marshall({
      pk: generateKey('payment_success', accountId),
      sk: paymentId
    })
  })

  return result.Item ? unmarshall(result.Item).paymentSuccessInfo as PaymentSuccessInfoOld : undefined
}

async function migrationPaymentSuccessForPaymentLog(paymentLog: PaymentLog): Promise<void> {
  const paymentSuccessOld = await loadPaymentSuccessOld(paymentLog.accountId, paymentLog.paymentId)
  if (!paymentSuccessOld) {
    return
  }
  const paymentSuccess: PaymentSuccess = {
    accountId: paymentLog.accountId,
    paymentId: paymentLog.paymentId,

    timestamp: paymentSuccessOld.timestamp,
    blockchain: paymentSuccessOld.blockchain,
    transaction: paymentLog.transaction,
    index: paymentLog.index,

    email: paymentSuccessOld.email,
    language: paymentSuccessOld.language,
    currency: paymentSuccessOld.currency,
    amountCurrency: paymentSuccessOld.amountCurrency,
    description: paymentSuccessOld.description,
    comment: null
  }
  console.log(`found payment success for accountId ${paymentSuccess.accountId} and paymentId ${paymentSuccess.paymentId}`)

  // await paymentDao.savePaymentSuccess(paymentSuccess)
}

async function migrationPaymentSuccesses(paymentLogs: PaymentLog[]): Promise<void> {
  await Promise.all(
    paymentLogs.map(paymentLog => migrationPaymentSuccessForPaymentLog(paymentLog))
  )
}

async function loadIpnResultOld(ipnKey: IpnKey): Promise<IpnResult | undefined> {
  const result = await dynamoService.readItem({
    TableName: appConfig.TABLE_NAME,
    Key: marshall({
      pk: generateKey('ipn_result', ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index),
      sk: generateKey(ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index)
    })
  })

  return result.Item ? unmarshall(result.Item).ipnResult as IpnResult : undefined
}

async function migrationIpnResultForPaymentLog(paymentLog: PaymentLog): Promise<void> {
  const ipnResult = await loadIpnResultOld(paymentLog)
  if (!ipnResult) {
    return
  }
  console.log(`found ipn result for accountId ${paymentLog.accountId} and paymentId ${paymentLog.paymentId}`)

  // await paymentDao.saveIpnResult(paymentLog, ipnResult)
}

async function migrationIpnResults(paymentLogs: PaymentLog[]): Promise<void> {
  await Promise.all(
    paymentLogs.map(paymentLog => migrationIpnResultForPaymentLog(paymentLog))
  )
}

async function loadIpnDataOld(ipnKey: IpnKey): Promise<IpnDataOld | undefined> {
  const result = await dynamoService.readItem({
    TableName: appConfig.TABLE_NAME,
    Key: marshall({
      pk: generateKey('ipn', ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index),
      sk: generateKey(ipnKey.accountId, ipnKey.paymentId, ipnKey.blockchain.toLocaleLowerCase(), ipnKey.transaction, ipnKey.index)
    })
  })

  return result.Item ? unmarshall(result.Item).ipn as IpnDataOld : undefined
}

async function migrationIpnDataForPaymentLog(paymentLog: PaymentLog): Promise<void> {
  const ipnDataOld = await loadIpnDataOld(paymentLog)
  if (!ipnDataOld) {
    return
  }

  const ipnData: IpnData = {
    accountId: ipnDataOld.accountId,
    paymentId: ipnDataOld.paymentId,

    block: ipnDataOld.block,
    timestamp: ipnDataOld.timestamp,
    transaction: ipnDataOld.transaction,
    index: ipnDataOld.index,

    from: ipnDataOld.from,
    to: ipnDataOld.to,
    direction: ipnDataOld.direction ?? 'incoming',

    amount: ipnDataOld.amount,
    amountUsd: ipnDataOld.amountUsd,
    amountCurrency: ipnDataOld.amountCurrency,

    totalAmountUsd: ipnDataOld.totalAmountUsd,
    totalAmountCurrency: ipnDataOld.totalAmountCurrency,

    blockchain: ipnDataOld.blockchain,
    tokenAddress: ipnDataOld.tokenAddress,
    tokenSymbol: ipnDataOld.tokenSymbol,
    tokenDecimals: ipnDataOld.tokenDecimals,
    tokenUsdPrice: ipnDataOld.tokenUsdPrice,

    currency: ipnDataOld.currency,
    currencyExchangeRate: ipnDataOld.currencyExchangeRate,

    comment: null
  }
  console.log(`found ipn data for accountId ${ipnData.accountId} and paymentId ${ipnData.paymentId}`)

  // await ipnDao.saveIpnData(ipnData)
}

async function migrationIpnData(paymentLogs: PaymentLog[]): Promise<void> {
  await Promise.all(
    paymentLogs.map(paymentLog => migrationIpnDataForPaymentLog(paymentLog))
  )
}

async function main() {
  console.log(`start migration script payment 1`)

  const profiles = await accountDao.listAccountProfiles()
  console.log(`found ${profiles.length} account profiles`)

  console.log(`start to migrate payment logs`)
  const paymentLogs = await migrationPaymentLogs(profiles)

  // console.log(`start to migrate payment successes`)
  // await migrationPaymentSuccesses(paymentLogs)

  // console.log(`start to migrate ipn results`)
  // await migrationIpnResults(paymentLogs)

  console.log(`start to migrate ipn data`)
  await migrationIpnData(paymentLogs)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
