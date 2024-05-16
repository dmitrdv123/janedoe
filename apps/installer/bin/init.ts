import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}`.trim() })

import * as fs from 'fs'
import * as path from 'path'

import { CloudFormation } from '@aws-sdk/client-cloudformation'

import { AppSettings, AppSettingsBlockchain, AppSettingsContracts, AppSettingsCurrency } from '@repo/dao/dist/src/interfaces/settings'
import { SettingsDao } from '@repo/dao/dist/src/dao/settings.dao'
import { AccountPaymentSettings } from '@repo/dao/dist/src/interfaces/account-settings'
import { daoContainer as dynamoContainer } from '@repo/dao-aws/dist/src/containers/dao.container'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import { evmContainer } from '@repo/evm/dist/src/containers/evm.container'
import { BitcoinWrapperService } from '@repo/common/dist/src/services/bitcoin-wrapper-service'
import { initAppConfig } from '@repo/common/dist/src/app-config'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { BlockchainSettings } from '@repo/dao/dist/src/interfaces/blockchain-settings'
import { BlockchainEvmClientConfig } from '@repo/dao/dist/src/interfaces/blockchain-evm-client-config'

import { env, loadFileAsJson, withEnv } from '../lib/utils'
import { APP_SETTINGS_PREFIX, BLOCKCHAIN_EVM_CLIENT_CONFIG_SETTINGS_PREFIX, BLOCKCHAIN_SETTINGS_PREFIX, DEFAULT_ACCOUNT_PAYMENT_SETTINGS_PREFIX } from '../lib/constants'

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
        if (process.env.NODE_ENV === 'local') {
          return true
        }

        return file.toLocaleLowerCase() !== 'hardhat.json'
          && file.toLocaleLowerCase() !== 'localhost.json'
          && file.toLocaleLowerCase() !== 'zksyncinmemorynode.json'
          && file.toLocaleLowerCase() !== 'zksyncdockerizednode.json'
          && file.toLocaleLowerCase() !== 'zksyncsepoliatestnet.json'
          && file.toLocaleLowerCase() !== 'tronshasta.json'
          && file.toLocaleLowerCase() !== 'tronnile.json'
          && file.toLocaleLowerCase() !== 'trondevelopment.json'
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
    saveBlockchainSettings(contracts, evmClientConfigs),
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
    currencies
  }

  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  await settingsDao.saveSettings(appSettings, APP_SETTINGS_PREFIX)
}

async function saveBlockchainSettings(contracts: AppSettingsContracts[], evmClientConfigs: BlockchainEvmClientConfig[]): Promise<void> {
  const settingsDao = dynamoContainer.resolve<SettingsDao>('settingsDao')
  const evmService = evmContainer.resolve<EvmService>('evmService')

  await Promise.all(
    contracts
      .map(async contract => {
        let shouldSave = false
        if (process.env.IS_DEV) {
          shouldSave = true
        } else {
          const existingSettings = await settingsDao.loadSettings<BlockchainSettings>(BLOCKCHAIN_SETTINGS_PREFIX, contract.blockchain)
          shouldSave = !existingSettings
        }

        if (shouldSave) {
          const evmClientConfig = evmClientConfigs.find(config => config.blockchain.toLocaleLowerCase() === contract.blockchain.toLocaleLowerCase())
          const blockNumber = await evmService.blockNumber(evmClientConfig, contract.chainId)
          const blockchainSettings: BlockchainSettings = {
            blockchain: contract.blockchain,
            block: blockNumber.toString()
          }

          await settingsDao.saveSettings(blockchainSettings, BLOCKCHAIN_SETTINGS_PREFIX, contract.blockchain)
        }
      })
  )
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

async function createBitcoinCentralWallet(): Promise<void> {
  console.log('Start to create bitcoin central wallet')

  const bitcoinService = commonContainer.resolve<BitcoinWrapperService>('bitcoinWrapperService')
  await bitcoinService.createBitcoinWallet(withEnv(env('BITCOIN_CENTRAL_WALLET')), true)

  console.log('End to create bitcoin central wallet')
}

async function init(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV ?? 'local'

  let bitcoinRpc = `http://${env('BITCOIN_USER')}:${env('BITCOIN_PASSWORD')}@127.0.0.1:${env('BITCOIN_PORT')}`
  if (nodeEnv !== 'local') {
    const cloudformation = new CloudFormation()
    const output = await cloudformation.describeStacks({
      StackName: withEnv('janedoe-main', '-')
    })

    const bitcoinRpcIp = output.Stacks?.[0].Outputs?.find(item => item.ExportName === withEnv('ec2-bitcoincore', '-'))
    if (!bitcoinRpcIp?.OutputValue) {
      throw new Error('Cannot find cloudformation output for ec2-bitcoincore')
    }

    bitcoinRpc = `http://${env('BITCOIN_USER')}:${env('BITCOIN_PASSWORD')}@${bitcoinRpcIp.OutputValue}:${env('BITCOIN_PORT')}`
  }

  initAppConfig({
    TABLE_NAME: withEnv(process.env.TABLE_NAME ?? ''),
    BITCOIN_RPC: bitcoinRpc
  })
}

async function main() {
  await init()

  await Promise.all([
    saveSettings(),
    saveDefaultAccountPaymentSettings(),
    createBitcoinCentralWallet()
  ])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
