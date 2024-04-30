const Migrations = artifacts.require('./Migrations.sol')

const { saveDeployments } = require('../src/utils')

module.exports = async function (deployer) {
  await deployer.deploy(Migrations)

  const migrationAddress = Migrations.address.startsWith('41') ? `0x${Migrations.address.substring(2)}` : Migrations.address

  await saveDeployments({
    chainId: `0x${parseInt(deployer.network_id).toString(16)}`,
    blockchain: deployer.network,
    contractAddresses: {
      Migrations: migrationAddress
    },
    contractDetails: {
      Migrations: 'Migrations'
    }
  })
}
