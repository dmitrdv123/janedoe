const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const { saveFile } = require('../src/utils')
const { NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS, DEPLOYMENTS_FOLDER } = require('../src/constants')

const WrappedNative = artifacts.require('./WrappedNative.sol')

module.exports = async function (deployer) {
  deployer.trufflePlugin = true

  const wrappedNative = await deployProxy(
    WrappedNative,
    [NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS],
    { deployer, initializer: 'initialize', kind: 'transparent' }
  )

  await saveFile(
    DEPLOYMENTS_FOLDER,
    `${deployer.network.toLocaleLowerCase()}.json`,
    {
      chainId: `0x${parseInt(deployer.network_id).toString(16)}`,
      blockchain: deployer.network,
      contractAddresses: {
        WrappedNative: wrappedNative.address
      },
      contractDetails: {
        WrappedNative: 'WrappedNative'
      }
    }
  )
}
