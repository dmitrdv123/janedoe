import * as hre from 'hardhat'

import { Addressable } from 'ethers'
import { Deployer } from '@matterlabs/hardhat-zksync'
import { Wallet } from 'zksync-ethers'

import { deployUpgradable, getNetworkInfo, saveFile } from '../src/utils'
import { NetworkInfo } from '../src/interfaces'
import { DEPLOYMENTS_FOLDER, NATIVE_DECIMALS, NATIVE_NAME, NATIVE_SYMBOL } from '../src/constants'

const contractVersionJanedoe = 'JaneDoe'
const contractVersionWrappedNative = 'WrappedNative'
const contractVersionRangoReceiver = 'RangoReceiver'

async function saveDeployment(janeDoeAddress: string | Addressable, wrappedNativeAddress: string | Addressable, rangoReceiverAddress: string | Addressable, networkInfo: NetworkInfo) {
  await saveFile(DEPLOYMENTS_FOLDER, `${networkInfo.name}.json`, {
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

export default async function () {
  const networkInfo = await getNetworkInfo()

  const privateKey = process.env.SIGNER
  if (!privateKey) {
    throw new Error('SIGNER is not set as env var')
  }

  const wallet = new Wallet(privateKey)
  const deployer = new Deployer(hre, wallet)

  const wrappedNativeAddress = await deployUpgradable(deployer, contractVersionWrappedNative, [NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS])
  const janeDoeAddress = await deployUpgradable(deployer, contractVersionJanedoe, ['http://localhost', wrappedNativeAddress])
  const rangoReceiverAddress = await deployUpgradable(deployer, contractVersionRangoReceiver, [janeDoeAddress])

  await saveDeployment(janeDoeAddress, wrappedNativeAddress, rangoReceiverAddress, networkInfo)
}
