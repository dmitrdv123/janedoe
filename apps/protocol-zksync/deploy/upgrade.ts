import * as hre from 'hardhat'

import { Deployer } from '@matterlabs/hardhat-zksync'
import { Wallet } from 'zksync-ethers'

import { AppSettingsContracts } from '@repo/dao/dist/src/interfaces/settings'

import { getNetworkInfo, loadFileAsJson, saveFile, upgrade } from '../src/utils'
import { RangoReceiver__factory, WrappedNative__factory } from '../typechain-types'
import { NetworkInfo } from '../src/interfaces'
import { DEPLOYMENTS_FOLDER, NATIVE_DECIMALS, NATIVE_NAME, NATIVE_SYMBOL } from '../src/constants'

async function upgradeWrappedNative(deployer: Deployer, contractSettings: AppSettingsContracts, contractVersion: string, contractInitialize: string) {
  const contractWrappedNative = WrappedNative__factory.connect(contractSettings.contractAddresses.WrappedNative, deployer.zkWallet)

  const [name, symbol, decimals] = await Promise.all([
    contractWrappedNative.name(),
    contractWrappedNative.symbol(),
    contractWrappedNative.decimals()
  ])

  console.log(`Before upgrade`)
  console.log(`WrappedNative: name - ${name}, symbol - ${symbol}, decimals - ${decimals}`)

  const args = [NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS]
  console.log(`Start upgrade WrappedNative to ${contractVersion} with args ${JSON.stringify(args)}`)
  const wrappedNativeAddressUpgraded = await upgrade(deployer, contractVersion, contractSettings.contractAddresses.WrappedNative, contractInitialize, args)
  console.log(`End upgrade WrappedNative to ${contractVersion}`)

  if (contractSettings.contractAddresses.WrappedNative !== wrappedNativeAddressUpgraded) {
    throw new Error(`Addresses after upgrade are not matched`)
  }

  const [name1, symbol1, decimals1] = await Promise.all([
    contractWrappedNative.name(),
    contractWrappedNative.symbol(),
    contractWrappedNative.decimals()
  ])

  console.log(`After upgrade`)
  console.log(`WrappedNative: name - ${name1}, symbol - ${symbol1}, decimals - ${decimals1}`)
}

async function upgradeJaneDoe(deployer: Deployer, contractSettings: AppSettingsContracts, contractVersion: string, contractInitialize: string) {
  const args = ['http://localhost', contractSettings.contractAddresses.WrappedNative]
  console.log(`Start upgrade JaneDoe to ${contractVersion} with args ${JSON.stringify(args)}`)
  const addressUpgraded = await upgrade(deployer, contractVersion, contractSettings.contractAddresses.JaneDoe, contractInitialize, args)
  console.log(`End upgrade JaneDoe to ${contractVersion}`)

  if (contractSettings.contractAddresses.JaneDoe !== addressUpgraded) {
    throw new Error(`Addresses after upgrade are not matched`)
  }
}

async function upgradeRangoReceiver(deployer: Deployer, contractSettings: AppSettingsContracts, contractVersion: string, contractInitialize: string) {
  const contractRangoReceiver = RangoReceiver__factory.connect(contractSettings.contractAddresses.RangoReceiver, deployer.zkWallet)
  const janedoeAddress = await contractRangoReceiver.janedoeAddress()

  console.log(`Before upgrade`)
  console.log(`RangoReceiver: janedoeAddress - ${janedoeAddress}`)

  const args = [contractSettings.contractAddresses.JaneDoe]

  console.log(`Start upgrade RangoReceiver to ${contractVersion} with args ${JSON.stringify(args)}`)
  const addressUpgraded = await upgrade(deployer, contractVersion, contractSettings.contractAddresses.RangoReceiver, contractInitialize, args)
  console.log(`End upgrade RangoReceiver to ${contractVersion}`)

  if (contractSettings.contractAddresses.RangoReceiver !== addressUpgraded) {
    throw new Error(`Addresses after upgrade are not matched`)
  }

  const janedoeAddressUpgraded = await contractRangoReceiver.janedoeAddress()

  console.log(`After upgrade`)
  console.log(`RangoReceiver: janedoeAddress - ${janedoeAddressUpgraded}`)
}

async function saveDeployment(networkInfo: NetworkInfo, contractSettings: AppSettingsContracts) {
  await saveFile(DEPLOYMENTS_FOLDER, `${networkInfo.name.toLocaleLowerCase()}.json`, contractSettings)
}

export default async function () {
  const contract = process.env.CONTRACT
  const contractVersion = process.env.VERSION
  const contractInitialize = process.env.INIT
  const signerPrivateKey = process.env.SIGNER

  if (!contract || !contractVersion || !contractInitialize || !signerPrivateKey) {
    throw new Error('Some of env vars CONTRACT, VERSION, INIT, SIGNER are not set')
  }

  const networkInfo = await getNetworkInfo()
  const deploymentFile = `${DEPLOYMENTS_FOLDER}/${networkInfo.name.toLocaleLowerCase()}.json`
  const contractSettings = await loadFileAsJson<AppSettingsContracts>(deploymentFile)
  if (!contractSettings) {
    throw new Error(`Cannot find file ${deploymentFile}`)
  }

  const wallet = new Wallet(signerPrivateKey)
  const deployer = new Deployer(hre, wallet)

  switch (contract.toLocaleLowerCase()) {
    case 'wrappednative':
      console.log(`upgrade WrappedNative ${contractVersion} ${contractInitialize}`)
      await upgradeWrappedNative(deployer, contractSettings, contractVersion, contractInitialize)
      break
    case 'janedoe':
      console.log(`upgrade JaneDoe ${contractVersion} ${contractInitialize}`)
      await upgradeJaneDoe(deployer, contractSettings, contractVersion, contractInitialize)
      break
    case 'rangoreceiver':
      console.log(`upgrade RangoReceiver ${contractVersion} ${contractInitialize}`)
      await upgradeRangoReceiver(deployer, contractSettings, contractVersion, contractInitialize)
      break
    default:
      throw new Error(`Arguments ${contract} is not known`)
  }

  if (!contractSettings.contractDetails) {
    contractSettings.contractDetails = {}
  }
  contractSettings.contractDetails[contract] = contractVersion
  await saveDeployment(networkInfo, contractSettings)
}
