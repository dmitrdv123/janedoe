# Turborepo Create React App starter

This is an official starter Turborepo.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [create-react-app](https://create-react-app.dev) app
- `web`: another [create-react-app](https://create-react-app.dev) app
- `payment`: a stub React component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-plugin-react` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) test runner for all things JavaScript
- [Prettier](https://prettier.io) for code formatting

## Using this example

Run the following command:

```sh
npx degit vercel/turbo/examples/with-create-react-app with-create-react-app
cd with-create-react-app
pnpm install
git init . && git add . && git commit -m "Init"
```

## Run local

```sh
VITE_APP_ENV=local NODE_ENV=local pnpm build
# run frontends
VITE_APP_ENV=local pnpm dev --filter=account --filter=docs --filter=payment --filter=landing --filter=support
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
```

## Run development

```sh
VITE_APP_ENV=development NODE_ENV=development pnpm build
# deploy resources in aws
NODE_ENV=development pnpm run deploy --filter=installer
# init necessary data into db and bitcoin
NODE_ENV=development pnpm run init --filter=installer
```

# Run production

```sh
VITE_APP_ENV=production NODE_ENV=production pnpm build
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

## TODO

others:

- after production deployment:
  - docs: Screenshot contains links to localhost, after starting to use domains we need to change images
  - api: create and use email to send notification using sns and proper domain

improvement backlog:

- support, account: submit button is enabled even if form is not valid
- payment: Payment settings is 1 - usdt, 2 - bnb. I have bnb and I dont have usdt. When I am switching to bnb blockchain I need to automatically choose bnb (need to choose token with no conversion and with enough balance).
- frontend: if user choose language and then go to another frontend then it should be set to the same lang
- payment: need to show balances in blockchain dropdown or in account dropdown in top menu
- payment: if error happens during convert and pay on payment stage then we need to show that conversion is done and we dont need to convert again
- account: payment settings page - there is a blink when warning "no blockchains" shown despite it is exist
- account: AccountServiceImpl.loadPaymentHistory we are loading full history and then cut it. Need to load only specific portion from DDB. Remove total size.
- bitcoin: BitcoinUtilsServiceImpl, createTransaction do not add input if amount is less than possible fee for this input
- api: split PaymentTask to separate tasks. So if we have issue with one blockchain then another will be not affected
- aws:
  - aws: make appservice private to access only from api gateway
  - aws: configure cloudformation logs to delete when stack destroyed and retain
  - api: set limits for requests using aws

long term backlog:

- account: news page
- protocol: hide shop address using https://railgun.org/wallets.html or something based on zksync alg
- account, payment, api: support tron, upgrade wrapped-native and rango-receiver to v2
- payment, protocol*: change conversion algorithm to use rango-receiver (Martin, 2024-05-22: `They mentioned in our new smart-contract that will be released in two months, we can whitelist your contract`). Add refund and refundNative functions to rango-receiver (https://docs.rango.exchange/api-integration/rango-api/basic-api-single-tx/message-passing-api). Update rango-receiver contract.

disputable backlog:

- all: start to use bun instead of nodejs - https://bun.sh/guides. Since it should be much faster
- account: payments - should add page num to url to be resistant to refreshing. From another side maybe we dont need to reload all that data since it can be heavy
- account, protocol: move logic of withdrawEthTo to withdrawTo (protocol), remove useNativeTokenWithdraw (account), withdrawEthTo (protocol)
- account: permission to withdraw balances
- payment: refactor evm contract write to use useJanedoeContractWrite from account
- api: pass key in url like https://v6.exchangerate-api.com/v6/905e72b5b182efdf60cea9b1/latest/USD instead of headers
- account: sign in form, button should be blocked even when modal is open and not only when api request is processing
- api: resend ipn should be done based on payment log and not based on saved ipn. Because in other case we can have situation when user can see payment but cannot resend ipn due to missing for some reasons saved ipn
- payment: token without conversion should have higher priority in dropdown
- aws: configure bitcoincore EC2 to be accessible only from apprunner. Disputable since we need to manage it outside
- payment: after success payment we need to check whether tx is read by api. Then we need to get amount received and show rest of sum if necessary to pay additionally or redirect to success. Disputable since user should wait until tx will be processed. It could take longer than expected and bring additional unnecessary dependency of user from backend.
- payment: use increaseAllowance instead of reset and set allowance. Disputable since openzeppelin ERC20 related classes does not have this method
- account: if we open some account page in new tab then user will be unauthenticated in all tabs in chrome. It is related to disabling metamask extension. Disputable since user wallet should be connected
- payment: calc required conversion amount based on already existed amount in wallet. Disputable since it is possible to have situation when amount is too small to have conversion. Another situation, user are going to use ETH with conversion to USDT, but it has enough USDT. In this case conversion will be skipped since amount is zero. Another situation, during calculating conversion we found one amount. But during swap we have another amount.


learning:

- account, payment: try to apply react patterns
  - https://github.com/alexis-regnaud/advanced-react-patterns/blob/main/src/patterns/compound-component/Counter.js,
  - https://medium.com/@mr.kashif.samman/design-patterns-for-react-native-applications-630e5eb9e34f
- account, payment: useEffect tips
  https://medium.com/@manuchimoliver779/best-practices-for-optimizing-the-useeffect-hook-in-react-react-native-1cab72ca980d
- account, payment: swq library to fetch data https://adevnadia.medium.com/how-to-fetch-data-in-react-with-performance-in-mind-a6cd5172ac41
- account, payment: approach to organize react folders https://medium.com/front-end-weekly/architecting-react-apps-like-its-2030-3eba0dab18b4
- DI and IOC in react - https://itnext.io/dependency-injection-in-react-6fa51488509f
- RBAC in nextjs - https://amit-g0swami.medium.com/implementing-role-based-access-control-rbac-in-next-js-79ac16713d0e
- React re-renders guide - https://adevnadia.medium.com/react-re-renders-guide-preventing-unnecessary-re-renders-8a3d2acbdba3
- redux alternatives:
  - zustang and swr over redux and fetch - https://medium.com/@riyalh1997/moving-away-from-redux-to-swr-zustand-cd5217471867
  - recoil
  - jotai - https://blog.bitsrc.io/using-jotai-in-your-react-application-de460568ac9d
- nestjs framework for api with dependency injection - https://nestjs.com/
- replace debouncing with useDeferredValue https://medium.com/@mujaffarhssn/say-goodbye-to-debouncing-use-usedeferredvalue-hook-7af7742d4456
- event emitter pattern to use in task and observers - https://medium.com/@arulvalananto/node-js-eventemitter-a-quick-5-minute-primer-on-what-it-is-why-its-essential-and-when-to-5fa218c9152f
- ways to conditional rendering - https://levelup.gitconnected.com/code-like-a-pro-advanced-conditional-rendering-techniques-in-react-8e0cfb9aa04f

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
