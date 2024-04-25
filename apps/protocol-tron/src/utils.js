const fs = require('fs')
const path = require('path')

const { DEPLOYMENTS_FOLDER } = require('./constants')

export async function saveDeployment(janeDoeAddress, wrappedNativeAddress, rangoReceiverAddress, networkName) {
  await saveFile(DEPLOYMENTS_FOLDER, `${networkName}.json`, {
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

export async function saveFile(dir, file, data) {
  const fullDir = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullDir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  const filePath = path.join(fullDir, file)
  const str = JSON.stringify(data, (_key, value) => typeof value === 'bigint' ? value.toString() : value)
  await fs.promises.writeFile(filePath, str)
}
