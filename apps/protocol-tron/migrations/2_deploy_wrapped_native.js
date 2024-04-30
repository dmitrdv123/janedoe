const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const { saveDeployments, loadDeployments } = require('../src/utils')
const { NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS } = require('../src/constants')

const WrappedNative = artifacts.require('./WrappedNative.sol')

module.exports = async function (deployer) {
  deployer.trufflePlugin = true

  const deployment = await loadDeployments(deployer.network)

  const wrappedNative = await deployProxy(
    WrappedNative,
    [NATIVE_NAME, NATIVE_SYMBOL, NATIVE_DECIMALS],
    { deployer, initializer: 'initialize', kind: 'transparent' }
  )

  deployment.contractAddresses.WrappedNative = wrappedNative.address
  deployment.contractDetails.WrappedNative = 'WrappedNative'

  await saveDeployments(deployment)
}
