import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import { DynamoDB } from '@aws-sdk/client-dynamodb'

import { AccountDaoImpl } from '@repo/dao-aws/dist/src/dao/account.dao'
import { BitcoinDaoImpl } from '@repo/dao-aws/dist/src/dao/bitcoin.dao'
import { PaymentDaoImpl } from '@repo/dao-aws/dist/src/dao/payment.dao'
import { NotificationDaoImpl } from '@repo/dao-aws/dist/src/dao/notification.dao'
import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'
import { BitcoinCoreServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin-core.service'
import { BitcoinServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin.service'
import { BitcoinUtilsServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin-utils.service'
import { BitcoinBlockServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'
import { BitcoinBlock, BitcoinUtxo } from '@repo/dao/dist/src/interfaces/bitcoin';
import { IpnKey } from '@repo/dao/dist/src/interfaces/ipn'
import { NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { CacheServiceImpl } from '@repo/common/dist/src/services/cache-service'
import { getBitcoinNetwork } from '@repo/bitcoin/dist/src/utils/bitcoin-utils'
import { BitcoinCoreError } from '@repo/bitcoin/dist/src/errors/bitcoin-core-error'

import { createAppConfig } from './app-config'
import { loadFile } from './utils'

createAppConfig()

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const cacheService = new CacheServiceImpl()
const accountDao = new AccountDaoImpl(dynamoService)
const bitcoinDao = new BitcoinDaoImpl(dynamoService, cacheService)
const paymentDao = new PaymentDaoImpl(dynamoService)
const notificationDao = new NotificationDaoImpl(dynamoService)
const bitcoinUtilsService = new BitcoinUtilsServiceImpl(getBitcoinNetwork())
const bitcoinCoreService = new BitcoinCoreServiceImpl()
const bitcoinService = new BitcoinServiceImpl(bitcoinCoreService, bitcoinUtilsService, bitcoinDao)
const bitcoinBlockService = new BitcoinBlockServiceImpl(bitcoinCoreService, cacheService, bitcoinDao)

async function bitcoinCoreServiceTests(): Promise<void> {
  const feeRate = await bitcoinCoreService.getFeeRate(3)
  console.log(`feeRate ${feeRate}`)
}

async function bitcoinServiceProdTests(): Promise<void> {
  try {
    await bitcoinService.withdraw('42oz0b2cnmh', 'bc1qtk2hkcqqjdtcmgcpjt9363uypsr0z0kpft9rst', '295')
  } catch (err) {
    if (err instanceof BitcoinCoreError) {
      const bitcoinCoreError = err as BitcoinCoreError
      console.error(`debug >> bitcoin core error happens`)
      console.error(bitcoinCoreError)
    } else {
      console.error(`debug >> error happens`)
      console.error(err)
    }
  }
}

async function transactionTests(): Promise<void> {
  const walletName = 'walletForPay1'
  const label1 = '123qwe'
  const label2 = '234qwe'
  const blockhash = '79a59a33033fd03215ad20dce1a8720a14c35fcf1b4c2c8f3bedd2fb5d1ca148'
  const address = 'bcrt1qxj6trv0fqw9m2makws6quj0ccmnvv7qs4c6yt2'

  const wallet = await bitcoinService.createWallet(walletName)
  console.log(`wallet created: ${JSON.stringify(wallet)}`)

  const walletAddress1 = await bitcoinService.createWalletAddress(walletName, label1)
  console.log(`wallet address created: ${JSON.stringify(walletAddress1)}`)
  const walletAddress2 = await bitcoinService.createWalletAddress(walletName, label2)
  console.log(`wallet address created: ${JSON.stringify(walletAddress2)}`)

  const block = await bitcoinBlockService.getBlock(blockhash)
  console.log(`block ${JSON.stringify(block)}`)

  await bitcoinBlockService.processBlock(block)

  const transactions = await bitcoinBlockService.listWalletTransactions(0, 10000)
  console.log(`transactions ${JSON.stringify(transactions)}`)

  const walletBalance = await bitcoinService.getWalletBalance(walletName)
  console.log(`wallet ${walletName} balance: ${walletBalance}`)

  const walletAddressBalance1 = await bitcoinService.getWalletAddressBalance(walletName, label1)
  console.log(`wallet ${walletName} address ${label1} balance: ${walletAddressBalance1}`)

  const walletAddressBalance2 = await bitcoinService.getWalletAddressBalance(walletName, label2)
  console.log(`wallet ${walletName} address ${label2} balance: ${walletAddressBalance2}`)

  await bitcoinService.withdraw(walletName, address, '295')
  console.log(`withdrawal of wallet ${walletName} to address ${address} was done`)
}

async function bitcoinServiceTests(): Promise<void> {
  const walletName = 'wallet2'
  const label1 = 'qwe123'
  const label2 = 'qwe124'
  const address = 'bcrt1qxj6trv0fqw9m2makws6quj0ccmnvv7qs4c6yt2'

  const wallet = await bitcoinService.createWallet(walletName)
  console.log(`wallet created: ${JSON.stringify(wallet)}`)

  const walletAddress1 = await bitcoinService.createWalletAddress(walletName, label1)
  console.log(`wallet address created: ${JSON.stringify(walletAddress1)}`)
  const walletAddress2 = await bitcoinService.createWalletAddress(walletName, label2)
  console.log(`wallet address created: ${JSON.stringify(walletAddress2)}`)

  const walletBalance = await bitcoinService.getWalletBalance(walletName)
  console.log(`wallet ${walletName} balance: ${walletBalance}`)

  const walletAddressBalance1 = await bitcoinService.getWalletAddressBalance(walletName, label1)
  console.log(`wallet ${walletName} address ${label1} balance: ${walletAddressBalance1}`)

  const walletAddressBalance2 = await bitcoinService.getWalletAddressBalance(walletName, label2)
  console.log(`wallet ${walletName} address ${label2} balance: ${walletAddressBalance2}`)

  const loadedWalletAddress1 = await bitcoinDao.loadWalletAddress(walletName, label1)
  console.log(`loaded wallet ${walletName} address ${label1}: ${JSON.stringify(loadedWalletAddress1)}`)

  let walletAddresses = await bitcoinDao.listWalletAddresses(walletName)
  console.log(`loaded wallet ${walletName} address: ${JSON.stringify(walletAddresses)}`)

  walletAddresses = await bitcoinDao.listAllWalletAddresses()
  console.log(`loaded all wallet addresses: ${JSON.stringify(walletAddresses)}`)

  await bitcoinService.withdraw(walletName, address, '295')
  console.log(`withdrawal of wallet ${walletName} to address ${address} was done`)
}

async function bitcoinBlockServiceTests(): Promise<void> {
  const fromBlockheight = 0
  const toBlockheight = 1599

  const blockheight1 = 1599
  const blockheight2 = 1598
  const blockheight3 = 1597

  const blockhash1 = '46763c3f4b19c07bb406d1f4b8151c78caa21bec439fc5e0bc0fec248e4bd396'
  const blockhash2 = '1564f58d87c9936edc57ef91ed4b3ff125a3ebd9a2b1f94965e9bb9e06f476f6'
  const blockhash3 = '02f516ba31ab2e8b61536542f281000a36b0aaad37d66f50d12bbd19e84d5ca6'

  const block1 = await bitcoinBlockService.getBlock(blockhash1)
  console.log(`block ${blockhash1}: ${JSON.stringify(block1)}`)

  const block2 = await bitcoinBlockService.getBlock(blockhash2)
  console.log(`block ${blockhash2}: ${JSON.stringify(block2)}`)

  const loadedBlockheight1 = await bitcoinBlockService.getBlockhash(blockheight1)
  console.log(`loaded blockhash for height ${blockheight1}: ${loadedBlockheight1}`)

  const loadedLatestProcessedBlock = await bitcoinBlockService.getLatestProcessedBlockHeight()
  console.log(`loaded latest processed block: ${JSON.stringify(loadedLatestProcessedBlock)}`)

  const transactionOutputs = await bitcoinBlockService.listWalletTransactions(0, 1599)
  console.log(`loaded transaction outputs from ${fromBlockheight} to ${toBlockheight}: ${JSON.stringify(transactionOutputs)}`)

  let latestProcessedBlockHeight = await bitcoinBlockService.getLatestProcessedBlockHeight()
  console.log(`latest processed blockhash: ${latestProcessedBlockHeight}`)

  await bitcoinBlockService.processBlock(block1)
  console.log(`block ${block1.hash} processed`)

  latestProcessedBlockHeight = await bitcoinBlockService.getLatestProcessedBlockHeight()
  console.log(`latest processed blockhash: ${latestProcessedBlockHeight}`)

  await bitcoinBlockService.processBlock(block2)
  console.log(`block ${block2.hash} processed`)

  latestProcessedBlockHeight = await bitcoinBlockService.getLatestProcessedBlockHeight()
  console.log(`loaded latest processed block: ${latestProcessedBlockHeight}`)
}

async function bitcoinBlockServiceProdTests(): Promise<void> {
  const blockhash1 = '000000000000000000012e1c0662d672efbcdbc315324aecb0e2a8f80fd9bf22'
  const dir = 'data/'
  const fileName = `block${blockhash1}.json`
  const filePath = `${dir}/${fileName}`

  // console.log(`start loading block ${blockhash1}`)
  // const block1 = await bitcoinBlockService.getBlock(blockhash1)
  // await saveFile(dir, fileName, block1)
  // console.log(`end loading block ${blockhash1}`)

  const block1 = await loadFile<BitcoinBlock>(filePath)
  if (!block1) {
    throw new Error(`Could not load block from ${filePath}`)
  }

  console.log(`start processing block ${block1.hash}`)
  await bitcoinBlockService.processBlock(block1)
  console.log(`end processing block ${block1.hash}`)
}

async function bitcoinDaoTests(): Promise<void> {
  const walletName = 'bitcoinDaoTest_wallet1'

  await bitcoinDao.saveWallet({
    walletName,
    data: {
      wif: 'wif',
      address: 'address'
    }
  })
  console.log(`debug >> save wallet done`)

  let wallet = await bitcoinDao.loadWallet(walletName)
  console.log(`debug >> load wallet done ${JSON.stringify(wallet)}`)

  await bitcoinDao.saveWallet({
    walletName,
    data: {
      wif: 'wif1',
      address: 'address1'
    }
  })
  console.log(`debug >> save wallet done`)

  wallet = await bitcoinDao.loadWallet(walletName)
  console.log(`debug >> load wallet done ${JSON.stringify(wallet)}`)

  await bitcoinDao.saveWalletAddress({
    walletName,
    label: 'label1',
    data: {
      wif: 'label1_wif',
      address: 'label1_address'
    }
  })
  console.log(`debug >> save wallet address done`)

  let walletAddress = await bitcoinDao.loadWalletAddress(walletName, 'label1')
  console.log(`debug >> load wallet address done ${JSON.stringify(walletAddress)}`)

  await bitcoinDao.saveWalletAddress({
    walletName,
    label: 'label1',
    data: {
      wif: 'label1_wif1',
      address: 'label1_address1'
    }
  })
  console.log(`debug >> save wallet address done`)

  await bitcoinDao.saveWalletAddress({
    walletName,
    label: 'label2',
    data: {
      wif: 'label2_wif1',
      address: 'label2_address1'
    }
  })
  console.log(`debug >> save wallet address done`)

  walletAddress = await bitcoinDao.loadWalletAddress(walletName, 'label1')
  console.log(`debug >> load wallet address done ${JSON.stringify(walletAddress)}`)

  let walletAddresses = await bitcoinDao.listWalletAddresses(walletName)
  console.log(`debug >> list wallet address for ${walletName} done: ${JSON.stringify(walletAddresses)}`)

  walletAddresses = await bitcoinDao.listAllWalletAddresses()
  console.log(`debug >> load all wallet addresses done: ${JSON.stringify(walletAddresses)}`)

  const utxos: BitcoinUtxo[] = [
    {
      walletName: 'walletName2',
      label: 'label2',
      data: {
        txid: 'txid2',
        vout: -1,
        hex: 'hex2',
        amount: 1,
        frozen: 0,
        address: 'address2'
      }
    }
  ]
  for (let i = 0; i < 30; ++i) {
    utxos.push(
      {
        walletName,
        label: 'label1',
        data: {
          txid: `txid${i}`,
          vout: i,
          hex: `hex${i}`,
          amount: i + 1,
          frozen: 0,
          address: `address${i}`
        }
      }
    )
  }
  await bitcoinDao.saveUtxos(utxos)
  console.log(`debug >> save utxos done`)

  const loadedUtxos = await bitcoinDao.listAllUtxos()
  console.log(`debug >> load all utxos done: ${JSON.stringify(loadedUtxos)}`)
}

async function accountDaoTests(): Promise<void> {
  const accounts = await accountDao.listAccountProfiles()
  console.log(`debug >> load account profiles done ${accounts.length}`)
  console.log(JSON.stringify(accounts))

  await accountDao.saveAccountTeamSettings(accounts[0].id, 'address1', {
    users: [
      {
        accountTeamUserSettingsId: 'accountTeamUserSettingsId11',
        address: 'address11',
        permissions: {
          'key11': 'View'
        }
      },
      {
        accountTeamUserSettingsId: 'accountTeamUserSettingsId12',
        address: 'address12',
        permissions: {
          'key12': 'View'
        }
      }
    ]
  })
  console.log(`debug >> save account team settings done`)

  await accountDao.saveAccountTeamSettings(accounts[1].id, 'address2', {
    users: [
      {
        accountTeamUserSettingsId: 'accountTeamUserSettingsId11',
        address: 'address11',
        permissions: {
          'key11': 'View'
        }
      },
      {
        accountTeamUserSettingsId: 'accountTeamUserSettingsId21',
        address: 'address21',
        permissions: {
          'key21': 'View'
        }
      },
      {
        accountTeamUserSettingsId: 'accountTeamUserSettingsId22',
        address: 'address22',
        permissions: {
          'key22': 'View'
        }
      }
    ]
  })
  console.log(`debug >> save account team settings done`)

  let address = 'address11'
  let sharedAccounts = await accountDao.listSharedAccounts(address)
  console.log(`debug >> loading shared accounts for ${address} done: found ${sharedAccounts.length} shared accounts`)
  console.log(JSON.stringify(sharedAccounts))

  address = 'address12'
  sharedAccounts = await accountDao.listSharedAccounts(address)
  console.log(`debug >> loading shared accounts for ${address} done: found ${sharedAccounts.length} shared accounts`)
  console.log(JSON.stringify(sharedAccounts))

  address = 'address21'
  sharedAccounts = await accountDao.listSharedAccounts(address)
  console.log(`debug >> loading shared accounts for ${address} done: found ${sharedAccounts.length} shared accounts`)
  console.log(JSON.stringify(sharedAccounts))

  address = 'address22'
  sharedAccounts = await accountDao.listSharedAccounts(address)
  console.log(`debug >> loading shared accounts for ${address} done: found ${sharedAccounts.length} shared accounts`)
  console.log(JSON.stringify(sharedAccounts))

  address = 'address23'
  sharedAccounts = await accountDao.listSharedAccounts(address)
  console.log(`debug >> loading shared accounts for ${address} done: found ${sharedAccounts.length} shared accounts`)
  console.log(JSON.stringify(sharedAccounts))
}

async function paymentLogDaoTests(): Promise<void> {
  await paymentDao.savePaymentLog({
    accountId: 'accountId1',
    paymentId: 'paymentId11',

    block: 'block1',
    timestamp: 0,
    transaction: 'tx1',
    index: 0,

    from: null,
    to: 'to1',
    direction: 'incoming',
    amount: '1',
    amountUsd: null,

    blockchain: 'blockchain1',
    tokenAddress: null,
    tokenSymbol: null,
    tokenDecimals: null,
    tokenUsdPrice: null,
  })
  console.log(`debug >> save payment log done`)

  await paymentDao.savePaymentLog({
    accountId: 'accountId1',
    paymentId: 'paymentId12',

    block: 'block2',
    timestamp: 0,
    transaction: 'tx2',
    index: 0,

    from: null,
    to: 'to2',
    direction: 'incoming',
    amount: '2',
    amountUsd: null,

    blockchain: 'blockchain2',
    tokenAddress: null,
    tokenSymbol: null,
    tokenDecimals: null,
    tokenUsdPrice: null,
  })
  console.log(`debug >> save payment log done`)

  await paymentDao.savePaymentLog({
    accountId: 'accountId2',
    paymentId: 'paymentId21',

    block: 'block3',
    timestamp: 0,
    transaction: 'tx3',
    index: 0,

    from: null,
    to: 'to3',
    direction: 'incoming',
    amount: '3',
    amountUsd: null,

    blockchain: 'blockchain3',
    tokenAddress: null,
    tokenSymbol: null,
    tokenDecimals: null,
    tokenUsdPrice: null,
  })
  console.log(`debug >> save payment log done`)

  let account = 'accountId1'
  let paymentLogs = await paymentDao.listPaymentLogs(account)
  console.log(`debug >> loading payment logs for ${account} done: found ${paymentLogs.length} payment logs`)
  console.log(JSON.stringify(paymentLogs))

  account = 'accountId2'
  paymentLogs = await paymentDao.listPaymentLogs(account)
  console.log(`debug >> loading payment logs for ${account} done: found ${paymentLogs.length} payment logs`)
  console.log(JSON.stringify(paymentLogs))

  account = 'accountId3'
  paymentLogs = await paymentDao.listPaymentLogs(account)
  console.log(`debug >> loading payment logs for ${account} done: found ${paymentLogs.length} payment logs`)
  console.log(JSON.stringify(paymentLogs))
}

async function notificationDaoTests(): Promise<void> {
  let ipnKey: IpnKey = {
    accountId: 'accountId1',
    paymentId: 'paymentId1',
    blockchain: 'blockchain1',
    transaction: 'transaction1',
    index: 0
  }
  await notificationDao.saveNotification({
    key: 'key1',
    notificationType: NotificationType.IPN,
    timestamp: 0,
    data: ipnKey
  })
  console.log(`debug >> save notification done`)

  ipnKey = {
    accountId: 'accountId2',
    paymentId: 'paymentId2',
    blockchain: 'blockchain2',
    transaction: 'transaction2',
    index: 1
  }
  await notificationDao.saveNotification({
    key: 'key2',
    notificationType: NotificationType.IPN,
    timestamp: 2,
    data: ipnKey
  })
  console.log(`debug >> save notification done`)

  ipnKey = {
    accountId: 'accountId3',
    paymentId: 'paymentId3',
    blockchain: 'blockchain3',
    transaction: 'transaction3',
    index: 1
  }
  await notificationDao.saveNotification({
    key: 'key3',
    notificationType: NotificationType.PAYMENT,
    timestamp: 3,
    data: ipnKey
  })
  console.log(`debug >> save notification done`)

  let notificationType = NotificationType.IPN
  let notifications = await notificationDao.listNotifications<IpnKey>(notificationType)
  console.log(`debug >> loading notifications for ${notificationType} done: found ${notifications.length} notifications`)
  console.log(JSON.stringify(notifications))

  await Promise.all(
    notifications.map(notification => notificationDao.deleteNotification(notification.key, notification.notificationType, notification.timestamp))
  )

  notificationType = NotificationType.PAYMENT
  notifications = await notificationDao.listNotifications<IpnKey>(notificationType)
  console.log(`debug >> loading notifications for ${notificationType} done: found ${notifications.length} notifications`)
  console.log(JSON.stringify(notifications))

  await Promise.all(
    notifications.map(notification => notificationDao.deleteNotification(notification.key, notification.notificationType, notification.timestamp))
  )
}

async function main() {
  console.log(`hello world!`)

  // await bitcoinServiceProdTests()
  // await bitcoinPaymentLogsIteratorTests()
  // await bitcoinBlockTaskTests()
  // await bitcoinCoreServiceTests()
  // await bitcoinServiceTests()
  // await bitcoinBlockServiceTests()
  // await bitcoinBlockServiceProdTests()
  // await transactionTests()
  // await bitcoinDaoTests()
  // await accountDaoTests()
  // await paymentLogDaoTests()
  // await notificationDaoTests()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
