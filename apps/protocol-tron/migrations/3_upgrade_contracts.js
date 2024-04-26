const { admin } = require('@openzeppelin/truffle-upgrades')
const ProxyAdmin = artifacts.require(
  '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json'
)

const { saveFile, loadFileAsJson } = require('../src/utils')
const { DEPLOYMENTS_FOLDER } = require('../src/constants')

const RangoReceiver = artifacts.require('./RangoReceiver')
const RangoReceiverV3 = artifacts.require('./RangoReceiverV3')

module.exports = async function (deployer) {
  try {
    const deploymentFile = `${DEPLOYMENTS_FOLDER}/${deployer.network.toLocaleLowerCase()}.json`
    const contractSettings = await loadFileAsJson(deploymentFile)
    if (!contractSettings) {
      throw new Error(`Cannot find file ${deploymentFile}`)
    }

    // Deploy the new RangoReceiverV3 implementation contract
    console.log('Start deploy RangoReceiverV3')
    await deployer.deploy(RangoReceiverV3)

    // Upgrade proxy contract by admin
    console.log('Start to upgrade proxy contract by admin')
    const adminIns = await admin.getInstance()
    const adminContract = await ProxyAdmin.at(adminIns.address)
    await adminContract.upgrade(RangoReceiver.address, RangoReceiverV3.address)

    // Init
    console.log(`Start to init RangoReceiverV3 with args ${[contractSettings.contractAddresses.JaneDoe]}`)
    const rangoReceiverV3Contract = await RangoReceiverV3.at(RangoReceiver.address)
    await rangoReceiverV3Contract.initialize3(contractSettings.contractAddresses.JaneDoe)

    if (!contractSettings.contractDetails) {
      contractSettings.contractDetails = {}
    }
    contractSettings.contractDetails.RangoReceiver = 'RangoReceiverV3'

    await saveFile(DEPLOYMENTS_FOLDER, `${contractSettings.blockchain.toLocaleLowerCase()}.json`, contractSettings)
  } catch (error) {
    console.error(error)
  }
}
