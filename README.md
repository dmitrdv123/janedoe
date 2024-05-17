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
# deploy resources in aws
NODE_ENV=production pnpm run deploy --filter=installer
# init necessary data into db and bitcoin
NODE_ENV=production pnpm run init --filter=installer
```

## TODO

others:

- payment: testing payment with conversion
- payment: if conversion transaction is succeded then we still need to check whether expected amount is the same as actual in other case we need to show error
- protocol: hide shop address using https://railgun.org/wallets.html or something based on zksync alg
- account: Remove yourself from team settings. All tabs are not visible and page are empty. Probably should be redirected to auth automatically. Or removing yourself should not be possible.
- account: similar to previous. Open page http://localhost:3002/app/#balances. Then disable share access for balances. Refresh page, empty page are visible.
- frontend: if user choose language and then go to another frontend then it should be set to the same lang
- api: faced with situation when account is exist but wallet is not. We can try to create wallet each time trying to load account (AccountService - loadAccountProfile methods)
- payment: option to disable conversion globally. Message regarding this for all account
- account: global news info message
- payment: after success payment we need to check whether tx is read by api. Then we need to get amount received and show rest of sum if necessary to pay additionally or redirect to success.
- payment: for evm we can find events with payment id and check whether it is success or not to redirect to success page
- support, account: submit button is enabled even if form is not valid
- payment: Payment settings is 1 - usdt, 2 - bnb. I have bnb and I dont have usdt. When I am switching to bnb blockchain I need to automatically choose bnb (need to choose token with no conversion and with enough balance).
- payment: need to show balances in blockchain dropdown or in account dropdown in top menu
- protocol, protocol-tron: upgrade wrapped-native and rango-receiver contracts based on contracts in protocol-zksync
- account: payment settings page - there is a blink when warning "no blockchains" shown despite it is exist
- after production deployment:
  - docs: Screenshot contains links to localhost, after starting to use domains we need to change images
  - api: create and use email to send notification using sns and proper domain
- aws:
  - aws: make appservice private to access only from api gateway
  - aws: configure cloudformation logs to delete when stack destroyed and retain
  - api: set limits for requests using aws

disputable:

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
