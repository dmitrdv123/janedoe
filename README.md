# JaneDoe

This is an official JaneDoe repo.

## Run local env

```sh
VITE_APP_ENV=local NODE_ENV=local pnpm build
# run frontends
VITE_APP_ENV=local pnpm dev --filter=landing --filter=docs --filter=account --filter=payment --filter=support
# run protocol
NODE_ENV=local pnpm dev --filter=protocol -- --network hardhat
# run protocol on zksync (optionally)
NODE_ENV=local pnpm dev --filter=protocol-zksync
# run protocol on tron (optionally)
NODE_ENV=local pnpm run dev --filter=protocol-tron
# deploy resources in aws
NODE_ENV=local pnpm run deploy --filter=installer
# deploy contracts
NODE_ENV=local pnpm run deploy --filter=protocol -- --network localhost
NODE_ENV=local CONTRACT=RangoReceiver VERSION=RangoReceiverV4 INIT=initialize4 pnpm run upgrade --filter=protocol -- --network localhost
NODE_ENV=local CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network localhost
NODE_ENV=local CONTRACT=JaneDoe VERSION=JaneDoeV2 INIT=initialize2 pnpm run upgrade --filter=protocol -- --network localhost
# deploy contracts to zksync (optionally)
NODE_ENV=local pnpm run deploy --filter=protocol-zksync -- --network zksyncInMemoryNode
# deploy contracts to tron (optionally)
NODE_ENV=local pnpm run deploy --filter=protocol-tron -- --network=tronDevelopment
# init necessary data into db and bitcoin
NODE_ENV=local pnpm run init --filter=installer
# some seed data like payments and accounts
NODE_ENV=local pnpm run seed --filter=protocol -- --network localhost
# start api
NODE_ENV=local pnpm start --filter=api
#statistics
NODE_ENV=local pnpm run script -- statistics
NODE_ENV=local pnpm run script -- articles
NODE_ENV=local pnpm run script -- telegram_bot
NODE_ENV=local pnpm run script -- telegram_bot_simple
```

## Run development env

```sh
VITE_APP_ENV=development NODE_ENV=development pnpm build
# deploy resources in aws
NODE_ENV=development pnpm run deploy --filter=installer
# init necessary data into db and bitcoin
NODE_ENV=development pnpm run init --filter=installer
#statistics
NODE_ENV=development pnpm run statistics
```

# Run production env

```sh
#statistics
NODE_ENV=production pnpm run script -- statistics
NODE_ENV=production pnpm run script -- articles
# build
VITE_APP_ENV=production NODE_ENV=production pnpm build
# deploy resources in aws
NODE_ENV=production pnpm run deploy --filter=installer
# init necessary data into db and bitcoin
NODE_ENV=production pnpm run init --filter=installer
# deploy contract
NODE_ENV=production pnpm run deploy --filter=protocol -- --network bsc
NODE_ENV=production pnpm run deploy --filter=protocol -- --network polygon
NODE_ENV=production pnpm run deploy --filter=protocol -- --network arbitrum
NODE_ENV=production pnpm run deploy --filter=protocol -- --network optimism
NODE_ENV=production pnpm run deploy --filter=protocol -- --network base
NODE_ENV=production pnpm run deploy --filter=protocol -- --network avalanche
NODE_ENV=production pnpm run deploy --filter=protocol-zksync -- --network zksync
NODE_ENV=production pnpm run deploy --filter=protocol -- --network linea
NODE_ENV=production pnpm run deploy --filter=protocol -- --network cronos
NODE_ENV=production pnpm run deploy --filter=protocol -- --network eth
NODE_ENV=production pnpm run deploy --filter=protocol-tron -- --network tron
# upgrade contracts
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network bsc
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network polygon
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network arbitrum
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network optimism
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network base
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network avalanche
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network linea
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network cronos
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network eth
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV2 INIT=initialize2 pnpm run upgrade --filter=protocol-zksync -- --network zksync

NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network bsc
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network polygon
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network arbitrum
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network optimism
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network base
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network avalanche
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network linea
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network cronos
NODE_ENV=production CONTRACT=WrappedNative VERSION=WrappedNativeV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network eth

# verify contracts

## eth
NODE_ENV=production pnpm run verify --filter=protocol -- --network eth 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network eth 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network eth 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## bsc
NODE_ENV=production pnpm run verify --filter=protocol -- --network bsc 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network bsc 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network bsc 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## polygon
NODE_ENV=production pnpm run verify --filter=protocol -- --network polygon 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network polygon 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network polygon 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## optimism
NODE_ENV=production pnpm run verify --filter=protocol -- --network optimism 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network optimism 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network optimism 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## arbitrum
NODE_ENV=production pnpm run verify --filter=protocol -- --network arbitrum 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network arbitrum 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network arbitrum 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## base
NODE_ENV=production pnpm run verify --filter=protocol -- --network base 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network base 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network base 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## cronos
NODE_ENV=production pnpm run verify --filter=protocol -- --network cronos 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network cronos 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network cronos 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## linea
NODE_ENV=production pnpm run verify --filter=protocol -- --network linea 0x62c00A7cA11F97306BAA6ff0E7ed53C1504e92BE
NODE_ENV=production pnpm run verify --filter=protocol -- --network linea 0x95005A422520Eeac518588365bCD6C383d59cf5a
NODE_ENV=production pnpm run verify --filter=protocol -- --network linea 0xB3976b428B1221b1F9B2A72d680d358F1C55a182

## zksync

There are error of verifying proxy admin, but it can be ignored since user does not interact with them

NODE_ENV=production pnpm run verify --filter=protocol-zksync -- --network zksync 0x184e78Ff869E842e8295f949c3c3E93B1E9A3E14
NODE_ENV=production pnpm run verify --filter=protocol-zksync -- --network zksync 0x8E5684AeC0117917Eb0e717ff5bB81D300EF6373
NODE_ENV=production pnpm run verify --filter=protocol-zksync -- --network zksync 0x61aD294245ebe00e76bfCCEcf0aCf2988Cc152b5

# deploy resources in aws
NODE_ENV=production pnpm run deploy --filter=installer
# init necessary data into db and bitcoin
NODE_ENV=production pnpm run init --filter=installer
```

# How to update tron contract

Example of update RangoReceiver contract:

1. Create file "./apps/protocol-tron/migrations/n_upgrade_rango_receiver_v3":

```
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
```

2. Run deployment:

```
NODE_ENV=production pnpm run deploy --filter=protocol-tron -- --network tron
```
