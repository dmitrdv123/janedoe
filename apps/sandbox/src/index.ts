import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })
import * as bitcoin from 'bitcoinjs-lib'

import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

import { BitcoinDaoImpl } from '@repo/dao-aws/dist/src/dao/bitcoin.dao'
import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'
import { BitcoinCoreServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin-core.service'
import { BitcoinServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin.service'
import { BitcoinUtilsServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin-utils.service'
import { BitcoinBlockServiceImpl } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'

import { createAppConfig } from './app-config'
import { SecretServiceImpl } from '@repo/dao-aws/dist/src/services/secret.service'

createAppConfig()

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const secretService = new SecretServiceImpl(new SecretsManagerClient())
const bitcoinDao = new BitcoinDaoImpl(dynamoService, secretService)
const bitcoinUtilsService = new BitcoinUtilsServiceImpl(bitcoin.networks.regtest)
const bitcoinCoreService = new BitcoinCoreServiceImpl()
const bitcoinService = new BitcoinServiceImpl(bitcoinCoreService, bitcoinUtilsService, bitcoinDao)
const bitcoinBlockService = new BitcoinBlockServiceImpl(bitcoinCoreService, bitcoinDao)

async function bitcoinCoreServiceTests() {
  const feeRate = await bitcoinCoreService.getFeeRate(3)
  console.log(`feeRate ${feeRate}`)
}

async function transactionTests() {
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

  const transactions = await bitcoinBlockService.listBlockTransactionOutputs(0, 10000)
  console.log(`transactions ${JSON.stringify(transactions)}`)

  const walletBalance = await bitcoinService.getWalletBalance(walletName)
  console.log(`wallet ${walletName} balance: ${walletBalance}`)

  const walletAddressBalance1 = await bitcoinService.getWalletAddressBalance(walletName, label1)
  console.log(`wallet ${walletName} address ${label1} balance: ${walletAddressBalance1}`)

  const walletAddressBalance2 = await bitcoinService.getWalletAddressBalance(walletName, label2)
  console.log(`wallet ${walletName} address ${label2} balance: ${walletAddressBalance2}`)

  await bitcoinService.withdraw(walletName, address)
  console.log(`withdrawal of wallet ${walletName} to address ${address} was done`)
}

async function bitcoinServiceTests() {
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

  const loadedWalletAddressByAddress1 = await bitcoinDao.loadWalletAddressByAddress(walletAddress1.data.address)
  console.log(`loaded wallet ${walletName} address ${label1} by address ${walletAddress1.data.address}: ${JSON.stringify(loadedWalletAddressByAddress1)}`)

  const walletAddressLabels = await bitcoinDao.listWalletAddressLabels(walletName)
  console.log(`loaded wallet ${walletName} address labels: ${JSON.stringify(walletAddressLabels)}`)

  await bitcoinService.withdraw(walletName, address)
  console.log(`withdrawal of wallet ${walletName} to address ${address} was done`)
}

async function bitcoinBlockServiceTests() {
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

  const transactionOutputs = await bitcoinBlockService.listBlockTransactionOutputs(0, 1599)
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

async function bitcoinDaoTests() {
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

  walletAddress = await bitcoinDao.loadWalletAddressByAddress('label1_address1')
  console.log(`debug >> load wallet address by address done ${JSON.stringify(walletAddress)}`)

  const walletAddressLabels = await bitcoinDao.listWalletAddressLabels(walletName)
  console.log(`debug >> list wallet address labels done ${JSON.stringify(walletAddressLabels)}`)
}

async function main() {
  console.log(`hello world!`)

  // await bitcoinPaymentLogsIteratorTests()
  // await bitcoinBlockTaskTests()
  // await bitcoinCoreServiceTests()
  // await bitcoinServiceTests()
  // await bitcoinBlockServiceTests()
  // await transactionTests()
  await bitcoinDaoTests()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
