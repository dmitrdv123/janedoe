const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const { saveDeployments, loadDeployments } = require('../src/utils')

const RangoReceiver = artifacts.require('./RangoReceiver.sol')

module.exports = async function (deployer) {
  deployer.trufflePlugin = true

  const deployment = await loadDeployments(deployer.network)
  if (!deployment.contractAddresses.JaneDoe) {
    throw new Error('Cannot find JaneDoe address')
  }

  const rangoReceiver = await deployProxy(
    RangoReceiver,
    [deployment.contractAddresses.JaneDoe],
    { deployer, initializer: 'initialize', kind: 'transparent' }
  )

  deployment.contractAddresses.RangoReceiver = rangoReceiver.address
  deployment.contractDetails.RangoReceiver = 'RangoReceiver'

  await saveDeployments(deployment)
}
