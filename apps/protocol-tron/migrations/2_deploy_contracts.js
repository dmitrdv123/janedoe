const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const { saveFile } = require('../src/utils')
const { NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS, DEPLOYMENTS_FOLDER } = require('../src/constants')

const WrappedNative = artifacts.require('./WrappedNative.sol')
const JaneDoe = artifacts.require('./JaneDoe.sol')
const RangoReceiver = artifacts.require('./RangoReceiver.sol')

module.exports = async function (deployer) {
  try {
    deployer.trufflePlugin = true

    const wrappedNative = await deployProxy(WrappedNative, [NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS], { deployer, initializer: 'initialize', kind: 'transparent' })
    const janeDoe = await deployProxy(JaneDoe, ['http://localhost', wrappedNative.address], { deployer, initializer: 'initialize', kind: 'transparent' })
    const rangoReceiver = await deployProxy(RangoReceiver, [janeDoe.address], { deployer, initializer: 'initialize', kind: 'transparent' })

    const deployment = {
      chainId: `0x${parseInt(deployer.network_id).toString(16)}`,
      blockchain: deployer.network,
      contractAddresses: {
        JaneDoe: janeDoe.address,
        WrappedNative: wrappedNative.address,
        RangoReceiver: rangoReceiver.address
      },
      contractDetails: {
        JaneDoe: 'JaneDoe',
        WrappedNative: 'WrappedNative',
        RangoReceiver: 'RangoReceiver'
      }
    }

    await saveFile(DEPLOYMENTS_FOLDER, `${deployment.blockchain.toLocaleLowerCase()}.json`, deployment)
  } catch (error) {
    console.error(error)
  }
}