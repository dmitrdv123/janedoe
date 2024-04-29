const { admin } = require('@openzeppelin/truffle-upgrades')
const ProxyAdmin = artifacts.require(
  '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json'
)

const { saveDeployments, loadDeployments } = require('../src/utils')

const RangoReceiver = artifacts.require('./RangoReceiver')
const RangoReceiverV3 = artifacts.require('./RangoReceiverV3')

module.exports = async function (deployer) {
  deployer.trufflePlugin = true

  const deployment = await loadDeployments(deployer.network)

  // Deploy the new RangoReceiverV3 implementation contract
  console.log('Start deploy RangoReceiverV3')
  await deployer.deploy(RangoReceiverV3)

  // Upgrade proxy contract by admin
  console.log('Start to upgrade proxy contract by admin')
  const adminIns = await admin.getInstance()
  const adminContract = await ProxyAdmin.at(adminIns.address)
  await adminContract.upgrade(RangoReceiver.address, RangoReceiverV3.address)

  // Init
  console.log(`Start to init RangoReceiverV3 with args ${[deployment.contractAddresses.JaneDoe]}`)
  const rangoReceiverV3Contract = await RangoReceiverV3.at(RangoReceiver.address)
  await rangoReceiverV3Contract.initialize3(deployment.contractAddresses.JaneDoe)

  if (!deployment.contractDetails) {
    deployment.contractDetails = {}
  }
  deployment.contractDetails.RangoReceiver = 'RangoReceiverV3'

  await saveDeployments(deployment)
}
