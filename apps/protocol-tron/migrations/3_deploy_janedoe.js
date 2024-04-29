const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const { saveDeployments, loadDeployments } = require('../src/utils')

const JaneDoe = artifacts.require('./JaneDoe.sol')

module.exports = async function (deployer) {
  deployer.trufflePlugin = true

  const deployment = await loadDeployments(deployer.network)
  if (!deployment.contractAddresses.WrappedNative) {
    throw new Error('Cannot find WrappedNative address')
  }

  const janeDoe = await deployProxy(
    JaneDoe,
    ['http://localhost', deployment.contractAddresses.WrappedNative],
    { deployer, initializer: 'initialize', kind: 'transparent' }
  )

  if (!deployment.contractAddresses) {
    deployment.contractAddresses = {}
  }
  deployment.contractAddresses.JaneDoe = janeDoe.address

  if (!deployment.contractDetails) {
    deployment.contractDetails = {}
  }
  deployment.contractDetails.JaneDoe = 'JaneDoe'

  await saveDeployments(deployment)
}
