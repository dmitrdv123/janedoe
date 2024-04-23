import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import { AppSettingsContracts } from '@repo/dao/dist/src/interfaces/settings'

import '../src/app-config'

import { getNetworkInfo, loadFileAsJson, saveFile, upgrade } from '../src/utils'
import { RangoReceiver__factory, WrappedNative__factory } from '../typechain-types'
import { NetworkInfo } from '../src/interfaces'
import { DEPLOYMENTS_FOLDER } from '../src/constants'

async function main() {
  const contract = process.env.CONTRACT
  const contractVersion = process.env.VERSION
  const contractInitialize = process.env.INIT

  if (!contract || !contractVersion || !contractInitialize) {
    throw new Error('Some of env vars CONTRACT, VERSION, INIT are not set')
  }

  const [signer] = await ethers.getSigners()

  const networkInfo = await getNetworkInfo()
  const deploymentFile = `${DEPLOYMENTS_FOLDER}/${networkInfo.name.toLocaleLowerCase()}.json`
  const contractSettings = await loadFileAsJson<AppSettingsContracts>(deploymentFile)
  if (!contractSettings) {
    throw new Error(`Cannot find file ${deploymentFile}`)
  }

  switch (contract.toLocaleLowerCase()) {
    case 'wrappednative':
      console.log(`upgrade WrappedNative ${contractVersion} ${contractInitialize}`)
      await upgradeWrappedNative(signer, contractSettings, contractVersion, contractInitialize)
      break
    case 'janedoe':
      console.log(`upgrade JaneDoe ${contractVersion} ${contractInitialize}`)
      await upgradeJaneDoe(signer, contractSettings, contractVersion, contractInitialize)
      break
    case 'rangoreceiver':
      console.log(`upgrade RangoReceiver ${contractVersion} ${contractInitialize}`)
      await upgradeRangoReceiver(signer, contractSettings, contractVersion, contractInitialize)
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

async function upgradeWrappedNative(signer: HardhatEthersSigner, contractSettings: AppSettingsContracts, contractVersion: string, contractInitialize: string) {
  const networkInfo = await getNetworkInfo()

  const nativeName = `${networkInfo.name.toLocaleUpperCase()}_NATIVE_NAME`
  const nativeNameValue = process.env[nativeName]
  if (!nativeNameValue) {
    throw new Error(`${nativeName} is not set as env var`)
  }

  const nativeSymbol = `${networkInfo.name.toLocaleUpperCase()}_NATIVE_SYMBOL`
  const nativeSymbolValue = process.env[nativeSymbol]
  if (!nativeSymbolValue) {
    throw new Error(`${nativeName} is not set as env var`)
  }

  const nativeDecimals = `${networkInfo.name.toLocaleUpperCase()}_NATIVE_DECIMALS`
  const nativeDecimalsValueStr = process.env[nativeDecimals]
  if (!nativeDecimalsValueStr) {
    throw new Error(`${nativeName} is not set as env var`)
  }
  const nativeDecimalsValue = parseInt(nativeDecimalsValueStr)

  const contractWrappedNative = WrappedNative__factory.connect(contractSettings.contractAddresses.WrappedNative, signer)

  const [name, symbol, decimals] = await Promise.all([
    contractWrappedNative.name(),
    contractWrappedNative.symbol(),
    contractWrappedNative.decimals()
  ])

  console.log(`Before upgrade`)
  console.log(`WrappedNative: name - ${name}, symbol - ${symbol}, decimals - ${decimals}`)

  const args = [nativeNameValue, nativeSymbolValue, nativeDecimalsValue]
  console.log(`Start upgrade WrappedNative to ${contractVersion} with args ${JSON.stringify(args)}`)
  const wrappedNativeAddressUpgraded = await upgrade(signer, contractVersion, contractSettings.contractAddresses.WrappedNative, contractInitialize, args)
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

async function upgradeJaneDoe(signer: HardhatEthersSigner, contractSettings: AppSettingsContracts, contractVersion: string, contractInitialize: string) {
  const args = ['http://localhost', contractSettings.contractAddresses.WrappedNative]
  console.log(`Start upgrade JaneDoe to ${contractVersion} with args ${JSON.stringify(args)}`)
  const addressUpgraded = await upgrade(signer, contractVersion, contractSettings.contractAddresses.JaneDoe, contractInitialize, args)
  console.log(`End upgrade JaneDoe to ${contractVersion}`)

  if (contractSettings.contractAddresses.JaneDoe !== addressUpgraded) {
    throw new Error(`Addresses after upgrade are not matched`)
  }
}

async function upgradeRangoReceiver(signer: HardhatEthersSigner, contractSettings: AppSettingsContracts, contractVersion: string, contractInitialize: string) {
  const contractRangoReceiver = RangoReceiver__factory.connect(contractSettings.contractAddresses.RangoReceiver, signer)
  const janedoeAddress = await contractRangoReceiver.janedoeAddress()

  console.log(`Before upgrade`)
  console.log(`RangoReceiver: janedoeAddress - ${janedoeAddress}`)

  const args = [contractSettings.contractAddresses.JaneDoe]
  console.log(`Start upgrade RangoReceiver to ${contractVersion} with args ${JSON.stringify(args)}`)
  const addressUpgraded = await upgrade(signer, contractVersion, contractSettings.contractAddresses.RangoReceiver, contractInitialize, args)
  console.log(`End upgrade RangoReceiver to ${contractVersion}`)

  if (contractSettings.contractAddresses.RangoReceiver !== addressUpgraded) {
    throw new Error(`Addresses after upgrade are not matched`)
  }

  const janedoeAddressUpgraded = await contractRangoReceiver.janedoeAddress()

  console.log(`After upgrade`)
  console.log(`RangoReceiver: janedoeAddress - ${janedoeAddressUpgraded}`)
}

async function saveDeployment(networkInfo: NetworkInfo, contractSettings: AppSettingsContracts) {
  await saveFile(DEPLOYMENTS_FOLDER, `${networkInfo.name}.json`, contractSettings)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
