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
NODE_ENV=local pnpm dev --filter=protocol-zksync -- --network zkSyncInMemoryNode
# deploy resources in aws
NODE_ENV=local pnpm run deploy --filter=installer
# deploy contracts
NODE_ENV=local pnpm run deploy --filter=protocol -- --network localhost
# deploy contracts to zksync (optionally)
NODE_ENV=local pnpm run deploy --filter=protocol-zksync -- --network zkSyncInMemoryNode
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
# upgrade contracts
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network bsc
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network polygon
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network arbitrum
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network optimism
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network base
NODE_ENV=production CONTRACT=RangoReceiver VERSION=RangoReceiverV3 INIT=initialize3 pnpm run upgrade --filter=protocol -- --network avalanche
# deploy resources in aws
NODE_ENV=production pnpm run deploy --filter=installer
# init necessary data into db and bitcoin
NODE_ENV=production pnpm run init --filter=installer
```

## TODO
others:
- testing payment with conversion
- payment: during conversion payment we can have situation when output amount changed. Currently we are showing error. Probably we need to automatically upgrade conversion card and show only warning
- api: monitoring api, monitoring payment error, monitoring rango error, monitoring bitcoin core error, monitoring conversion error, performance counters
- api: we are saving tokens into db with address and blockchain as pk. However we have multiple tokens with the same such pk. Need to investigate it
- aws: make appservice private to access only from api gateway
- aws: configure cloudformation logs to delete when stack destroyed and retain
- protocol: hide shop address using https://railgun.org/wallets.html or something based on zksync alg
- api: create and use email to send notification
- account: Remove yourself from team settings. All tabs are not visible and page are empty. Probably should be redirected to auth automatically. Or removing yourself should not be possible.
- account: similar to previous. Open page http://localhost:3002/app/#balances. Then disable share access for balances. Refresh page, empty page are visible.
- account: periodically update payments by timer
- docs: Screenshot contains links to localhost, after starting to use domains we need to change images
- frontend: if user choose language and then go to another frontend then it should be set to the same lang
- landing, docs: replace N and K with real values of tokens and blockchains
- api: set limits for requests using aws
- payment: if conversion transaction is succeded then we still need to check whether expected amount is the same as actual in other case we need to show error
- protocol: deploy contracts to evm blockchains
- api: faced with situation when account is exist but wallet is not. We can try to create wallet each time trying to load account (AccountService - loadAccountProfile* methods)
- payment: option to disable conversion globally. Message regarding this for all account
- account: option to disable conversion.
- account: global news info message
- payment: token without conversion should have higher priority in dropdown
- payment: after success payment we need to check whether tx is read by api. Then we need to get amount received and show rest of sum if necessary to pay additionally or redirect to success.
- payment: for evm we can find events with payment id and check whether it is success or not to redirect to success page
- aws: configure bitcoincore EC2 to be accessible only from apprunner. Disputable since we need to manage it outside
- support, account: submit button is enabled even if form is not valid
- payment: usdt and usdc is not working (allowance is not found)
- payment: tx is done on arb but I get error:
```
Payment has been failed
Transaction receipt with hash "0xe9ca64dbb3ad46dc00bb47a907e4355fb9fe526fd0532be771dc844fd4c74dc2" could not be found. The Transaction may not be processed on a block yet. Version: viem@1.20.3
```
- account: balance page, do the withdraw. SWitch blockchain in metamask. Wait for a long time. Then error:
```
Transaction with hash "0x58425ba4ded7aa2b61504669f49e20a1f4582e6448a3ba538bc6a63d2d6aee10" could not be found. Version: viem@1.20.3
```
- account:
  - switch to binance
  - withdraw all for arb
  - a lot of errors
- account: payment settings page - there is a blink when warning "no blockchains" shown despite it is exist
- installer: create and reimport all wallet to central wallet
- protocol, protocol-zksync:
protocol:deploy: ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
protocol:deploy: │ Warning: It looks like you are using '<address payable>.send/transfer(<X>)' without providing    │
protocol:deploy: │ the gas amount. Such calls will fail depending on the pubdata costs.                             │
protocol:deploy: │ This might be a false positive if you are using an interface (like IERC20) instead of the        │
protocol:deploy: │ native Solidity `send/transfer`.                                                                 │
protocol:deploy: │ Please use 'payable(<address>).call{value: <X>}("")' instead, but be careful with the reentrancy │
protocol:deploy: │ attack. `send` and `transfer` send limited amount of gas that prevents reentrancy, whereas       │
protocol:deploy: │ `<address>.call{value: <X>}` sends all gas to the callee. Learn more on                          │
protocol:deploy: │ https://docs.soliditylang.org/en/latest/security-considerations.html#reentrancy

disputable:
- all: start to use bun instead of nodejs - https://bun.sh/guides. Since it should be much faster
- account: payments - should add page num to url to be resistant to refreshing. From another side maybe we dont need to reload all that data since it can be heavy
- account, protocol: move logic of withdrawEthTo to withdrawTo (protocol), remove useNativeTokenWithdraw (account), withdrawEthTo (protocol)
- account: permission to withdraw balances
- payment: refactor evm contract write to use useJanedoeContractWrite from account
- api: pass key in url like https://v6.exchangerate-api.com/v6/905e72b5b182efdf60cea9b1/latest/USD instead of headers
- account: sign in form, button should be blocked even when modal is open and not only when api request is processing
- api: resend ipn should be done based on payment log and not based on saved ipn. Because in other case we can have situation when user can see payment but cannot resend ipn due to missing for some reasons saved ipn

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