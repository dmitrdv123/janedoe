import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}`.trim() })

import * as fs from 'fs'
import * as path from 'path'

import { AppSettings, AppSettingsBlockchain, AppSettingsContracts, AppSettingsCurrency } from '@repo/dao/dist/src/interfaces/settings'
import { SettingsDao } from '@repo/dao/dist/src/dao/settings.dao'
import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { AccountPaymentSettings } from '@repo/dao/dist/src/interfaces/account-settings'
import { daoContainer as dynamoContainer } from '@repo/dao-aws/dist/src/containers/dao.container'
import { initAppConfig } from '@repo/common/dist/src/app-config'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { BlockchainSettings } from '@repo/dao/dist/src/interfaces/blockchain-settings'
import { BlockchainEvmClientConfig } from '@repo/dao/dist/src/interfaces/blockchain-evm-client-config'
import { BitcoinCoreService } from '@repo/bitcoin/dist/src/services/bitcoin-core.service'

import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'
import { bitcoinContainer } from '@repo/bitcoin/dist/src/containers/bitcoin.container'

import { env, loadFileAsJson, withEnv } from '../lib/utils'
import { APP_SETTINGS_PREFIX, BLOCKCHAIN_BTC, BLOCKCHAIN_EVM_CLIENT_CONFIG_SETTINGS_PREFIX, BLOCKCHAIN_SETTINGS_PREFIX, DEFAULT_ACCOUNT_PAYMENT_SETTINGS_PREFIX } from '../lib/constants'

async function saveDefaultAccountPaymentSettings(): Promise<void> {
  console.log('Start to save default account settings')

  const settingsFilePath = 'data/default-account-settings.json'
  const settings = await loadFileAsJson<AccountPaymentSettings>(settingsFilePath)
  if (!settings) {
    throw new Error(`Cannot find file ${settingsFilePath}`)
  }

  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  await settingsDao.saveSettings(settings, DEFAULT_ACCOUNT_PAYMENT_SETTINGS_PREFIX)

  console.log('End to save default account settings')
}

async function saveSettings(): Promise<void> {
  console.log('Start to save settings')

  const deploymentsFolder = 'data/deployments'
  const contracts: AppSettingsContracts[] = await Promise.all(
    fs.readdirSync(path.join(process.cwd(), deploymentsFolder))
      .filter(file => {
        const fileTmp = file.toLocaleLowerCase()

        if (!fileTmp.endsWith('.json')) {
          return false
        }

        if (process.env.NODE_ENV === 'local') {
          return true
        }

        return ![
          'hardhat.json',
          'localhost.json',
          'zksyncinmemorynode.json',
          'zksyncdockerizednode.json',
          'zksyncsepoliatestnet.json',
          'tronshasta.json',
          'tronnile.json',
          'trondevelopment.json'
        ].includes(fileTmp)
      })
      .map(
        async file => {
          const filePath = `${deploymentsFolder}/${file}`
          const data = await loadFileAsJson<AppSettingsContracts>(filePath)
          if (!data) {
            throw new Error(`Cannot find file ${filePath}`)
          }

          return data
        }
      )
  )

  const evmClientConfigFilePath = 'data/blockchain-evm-client-config-settings.json'
  const evmClientConfigs = await loadFileAsJson<BlockchainEvmClientConfig[]>(evmClientConfigFilePath)
  if (!evmClientConfigs) {
    throw new Error(`Cannot find file ${evmClientConfigFilePath}`)
  }

  await Promise.all([
    saveAppSettings(contracts),
    saveEvmBlockchainSettings(contracts, evmClientConfigs),
    saveBitcoinBlockchainSettings(),
    saveBlockchainBlockchainEvmClientConfigSettings(evmClientConfigs)
  ])

  console.log('End to save settings')
}

async function saveAppSettings(contracts: AppSettingsContracts[]): Promise<void> {
  const paymentBlockchains: AppSettingsBlockchain[] = contracts.map(item => ({
    blockchain: item.blockchain
  }))
  paymentBlockchains.push({ blockchain: 'btc' })

  const currenciesFilePath = 'data/currencies.json'
  const currencies: AppSettingsCurrency[] | undefined = await loadFileAsJson<AppSettingsCurrency[]>(currenciesFilePath)
  if (!currencies) {
    throw new Error(`Cannot find file ${currenciesFilePath}`)
  }

  const appSettings: AppSettings = {
    paymentBlockchains,
    contracts,
    currencies,
    disableConversion: false
  }

  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  await settingsDao.saveSettings(appSettings, APP_SETTINGS_PREFIX)
}

async function saveEvmBlockchainSettings(contracts: AppSettingsContracts[], evmClientConfigs: BlockchainEvmClientConfig[]): Promise<void> {
  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  const evmService = evmContainer.resolve<EvmService>('evmService')

  await Promise.all(
    contracts
      .map(async contract => {
        const evmClientConfig = evmClientConfigs.find(config => config.blockchain.toLocaleLowerCase() === contract.blockchain.toLocaleLowerCase())
        const blockNumber = await evmService.blockNumber(evmClientConfig, contract.chainId)
        const blockchainSettings: BlockchainSettings = {
          blockchain: contract.blockchain,
          block: blockNumber.toString()
        }

        await settingsDao.saveSettings(blockchainSettings, BLOCKCHAIN_SETTINGS_PREFIX, contract.blockchain)
      })
  )
}

async function saveBitcoinBlockchainSettings(): Promise<void> {
  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  const bitcoinCoreService = bitcoinContainer.resolve<BitcoinCoreService>('bitcoinCoreService')
  const bitcoinDao = dynamoContainer.resolve<BitcoinDao>('bitcoinDao')

  const latestBitcoinBlockHeight = await bitcoinCoreService.getLatestBlockHeight()

  const blockchainSettings: BlockchainSettings = {
    blockchain: BLOCKCHAIN_BTC,
    block: latestBitcoinBlockHeight.toString()
  }

  await Promise.all([
    settingsDao.saveSettings(blockchainSettings, BLOCKCHAIN_SETTINGS_PREFIX, BLOCKCHAIN_BTC),
    bitcoinDao.saveLatestProcessedBlockHeight(latestBitcoinBlockHeight)
  ])
}

async function saveBlockchainBlockchainEvmClientConfigSettings(evmClientConfigs: BlockchainEvmClientConfig[]): Promise<void> {
  console.log(`Start to save blockchain transport settings for ${evmClientConfigs.length} blockchains`)

  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  await Promise.all(
    evmClientConfigs.map(async item => {
      await settingsDao.saveSettings(item, BLOCKCHAIN_EVM_CLIENT_CONFIG_SETTINGS_PREFIX, item.chainId)
    })
  )

  console.log(`End to save blockchain transport settings for ${evmClientConfigs.length} blockchains`)
}

async function init(): Promise<void> {
  if (!process.env.SECRETS) {
    throw new Error('SECRETS is not set')
  }

  const {
    BITCOIN_RPC,
    BITCOIN_FEE_RPC
  } = JSON.parse(process.env.SECRETS)

  initAppConfig({
    TABLE_NAME: withEnv(process.env.TABLE_NAME ?? ''),
    BITCOIN_RPC: BITCOIN_RPC,
    BITCOIN_FEE_RPC: BITCOIN_FEE_RPC
  })
}

async function main() {
  await init()

  await Promise.all([
    saveSettings(),
    saveDefaultAccountPaymentSettings()
  ])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
