import { ethers } from 'hardhat'
import { Addressable } from 'ethers'

import '../src/app-config'

import { deployUpgradable, getNetworkInfo, saveFile } from '../src/utils'
import { NetworkInfo } from '../src/interfaces'
import { DEPLOYMENTS_FOLDER } from '../src/constants'

const contractVersionJanedoe = 'JaneDoe'
const contractVersionWrappedNative = 'WrappedNative'
const contractVersionRangoReceiver = 'RangoReceiver'

async function main() {
  const [signer] = await ethers.getSigners()
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

  const wrappedNativeAddress = await deployUpgradable(signer, contractVersionWrappedNative, [nativeNameValue, nativeSymbolValue, nativeDecimalsValue])
  const janeDoeAddress = await deployUpgradable(signer, contractVersionJanedoe, ['http://localhost', wrappedNativeAddress])
  const rangoReceiverAddress = await deployUpgradable(signer, contractVersionRangoReceiver, [janeDoeAddress])

  await saveDeployment(janeDoeAddress, wrappedNativeAddress, rangoReceiverAddress, networkInfo)
}

async function saveDeployment(janeDoeAddress: string | Addressable, wrappedNativeAddress: string | Addressable, rangoReceiverAddress: string | Addressable, networkInfo: NetworkInfo) {
  await saveFile(DEPLOYMENTS_FOLDER, `${networkInfo.name.toLocaleLowerCase()}.json`, {
    chainId: networkInfo.hexChainId,
    blockchain: networkInfo.name,
    contractAddresses: {
      JaneDoe: janeDoeAddress,
      WrappedNative: wrappedNativeAddress,
      RangoReceiver: rangoReceiverAddress
    },
    contractDetails: {
      JaneDoe: contractVersionJanedoe,
      WrappedNative: contractVersionWrappedNative,
      RangoReceiver: contractVersionRangoReceiver
    }
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
