import { ethers } from 'hardhat'
import { customAlphabet } from 'nanoid'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import '../src/app-config'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import { AppSettingsContracts } from '@repo/dao/dist/src/interfaces/settings'
import { Account } from '@repo/dao/dist/src/interfaces/account-profile'
import { AccountPaymentSettings } from '@repo/dao/dist/src/interfaces/account-settings'
import { BitcoinService } from '@repo/bitcoin/dist/src/services/bitcoin.service'

import { daoContainer as dynamoContainer } from '@repo/dao-aws/dist/src/containers/dao.container'
import { bitcoinContainer } from '@repo/bitcoin/dist/src/containers/bitcoin.container'

import { JaneDoe, JaneDoe__factory, WrappedNative, WrappedNative__factory } from '../typechain-types'
import { DEPLOYMENTS_FOLDER, USDC_ADDRESS, USDT_ADDRESS } from '../src/constants'
import { loadFile, loadFileAsJson, encrypt, printBalances, randomIntFromInterval, printBalancesEth, printBalancesToken, getNetworkInfo } from '../src/utils'
import { EthPayer, EthPayerBuilder } from '../src/services/payers/eth-payer'
import { TokenPayer, TokenPayerBuilder } from '../src/services/payers/token-payer'
import { BtcPayer, BtcPayerBuilder } from '../src/services/payers/btc-payer'

let accounts: HardhatEthersSigner[]

let contractJanedoe: JaneDoe
let contractWrappedNative: WrappedNative

let ethPayer: EthPayer
let tokenPayer: TokenPayer
let btcPayer: BtcPayer

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz')
const accountDao = dynamoContainer.resolve<AccountDao>('accountDao')
const bitcoinService = bitcoinContainer.resolve<BitcoinService>('bitcoinService')

async function init() {
  accounts = await ethers.getSigners()

  const networkInfo = await getNetworkInfo()
  const deploymentFile = `${DEPLOYMENTS_FOLDER}/${networkInfo.name.toLocaleLowerCase()}.json`
  const contractSettings = await loadFileAsJson<AppSettingsContracts>(deploymentFile)
  if (!contractSettings) {
    throw new Error(`Cannot find file ${deploymentFile}`)
  }

  ethPayer = EthPayerBuilder.getInstance()
    .withContractSettings(contractSettings)
    .withAccountDao(accountDao)
    .build()

  tokenPayer = TokenPayerBuilder.getInstance()
    .withContractSettings(contractSettings)
    .withAccountDao(accountDao)
    .build()

  btcPayer = BtcPayerBuilder.getInstance()
    .withAccountDao(accountDao)
    .build()

  contractJanedoe = JaneDoe__factory.connect(contractSettings.contractAddresses.JaneDoe)
  contractWrappedNative = WrappedNative__factory.connect(contractSettings.contractAddresses.WrappedNative)
}

async function createAccounts() {
  const accountTemplateFile = 'data/account.txt'
  const accountTemplate = await loadFile(accountTemplateFile)
  if (!accountTemplate) {
    throw new Error(`Cannot find file ${accountTemplateFile}`)
  }

  const accountDefaultSettingsFile = '../installer/data/default-account-settings.json'
  const accountDefaultSettings = await loadFileAsJson<AccountPaymentSettings>(accountDefaultSettingsFile)
  if (!accountDefaultSettings) {
    throw new Error(`Cannot find file ${accountDefaultSettingsFile}`)
  }

  await Promise.all(
    accounts.map(account => createAccount(account, accountTemplate, accountDefaultSettings))
  )
}

async function createAccount(account: HardhatEthersSigner, accountTemplate: string, accountDefaultSettings: AccountPaymentSettings) {
  console.log(`Start to create account for address ${account.address}`)

  const existedAccountProfile = await accountDao.loadAccountProfileByAddress(account.address)
  const id: string = existedAccountProfile ? existedAccountProfile.id : nanoid(11)

  if (!existedAccountProfile) {
    const secret = encrypt(nanoid())

    const accountToCreate = accountTemplate
      .replaceAll('${ID}', id)
      .replaceAll('${ADDRESS}', account.address)
      .replaceAll('${SECRET}', secret)

    const accountProfile: Account = JSON.parse(accountToCreate)
    accountProfile.settings.paymentSettings.blockchains = [...accountProfile.settings.paymentSettings.blockchains, ...accountDefaultSettings.blockchains]
    accountProfile.settings.paymentSettings.assets = [...accountProfile.settings.paymentSettings.assets, ...accountDefaultSettings.assets]

    console.log(`Start to save account for id ${id} and address ${account.address}`)
    await accountDao.saveAccount(accountProfile)
    console.log(`End to save account for id ${id} and address ${account.address}`)
  }

  console.log(`Start to create bitcoin wallet for account id ${id} and address ${account.address}`)
  await bitcoinService.createWallet(id)
  console.log(`End to create bitcoin wallet for account id ${id} and address ${account.address}`)

  console.log(`End to create account for id ${id} and address ${account.address}`)
}

async function mintTokens(erc20Address: string) {
  console.log('Balances before:')
  await Promise.all(accounts.map(account => printBalances(account, erc20Address)))

  console.log('Mint for accounts')
  await Promise.all(
    accounts.map(account => tokenPayer.mint(account, 1, erc20Address))
  )

  console.log('Balances after:')
  await Promise.all(accounts.map(account => printBalances(account, erc20Address)))
}

async function payEthManually(from: HardhatEthersSigner, to: HardhatEthersSigner, amount: number) {
  console.log('From balances before')
  await printBalancesEth(from, contractJanedoe, contractWrappedNative)

  console.log('To balances before')
  await printBalancesEth(to, contractJanedoe, contractWrappedNative)

  console.log(`Pay from ${from.address} to ${to.address} amount ${amount} ETH`)
  await ethPayer.payManually(from, to, amount)

  console.log('From balances after')
  await printBalancesEth(from, contractJanedoe, contractWrappedNative)

  console.log('To balances after')
  await printBalancesEth(to, contractJanedoe, contractWrappedNative)
}

async function payEth(from: HardhatEthersSigner, to: HardhatEthersSigner, amount: number) {
  console.log('From balances before')
  await printBalancesEth(from, contractJanedoe, contractWrappedNative)

  console.log('To balances before')
  await printBalancesEth(to, contractJanedoe, contractWrappedNative)

  console.log(`Pay from ${from.address} to ${to.address} amount ${amount}`)
  await ethPayer.pay(from, to, amount)

  console.log('From balances after')
  await printBalancesEth(from, contractJanedoe, contractWrappedNative)

  console.log('To balances after')
  await printBalancesEth(to, contractJanedoe, contractWrappedNative)
}

async function payToken(from: HardhatEthersSigner, to: HardhatEthersSigner, amount: number, erc20Address: string) {
  console.log('From balances before')
  await printBalancesToken(from, contractJanedoe, erc20Address)

  console.log('To balances before')
  await printBalancesToken(to, contractJanedoe, erc20Address)

  console.log(`Pay from ${from.address} to ${to.address} amount ${amount}`)
  await tokenPayer.pay(from, to, amount, erc20Address)

  console.log('From balances after')
  await printBalancesToken(from, contractJanedoe, erc20Address)

  console.log('To balances after')
  await printBalancesToken(to, contractJanedoe, erc20Address)
}

async function withdrawEth(account: HardhatEthersSigner, amount: number) {
  console.log('Balances before')
  await printBalancesEth(account, contractJanedoe, contractWrappedNative)

  console.log(`Withdraw to ${account.address} amount ${amount}`)
  await ethPayer.withdraw(account, amount)

  console.log('Balances after')
  await printBalancesEth(account, contractJanedoe, contractWrappedNative)
}

async function withdrawToken(account: HardhatEthersSigner, amount: number, erc20Address: string) {
  console.log('balances before')
  await printBalancesToken(account, contractJanedoe, erc20Address)

  console.log(`Withdraw to ${account.address} amount ${amount}`)
  await tokenPayer.withdraw(account, amount, erc20Address)

  console.log('balances after')
  await printBalancesToken(account, contractJanedoe, erc20Address)
}

async function payBtc(from: string, to: HardhatEthersSigner, amount: number) {
  console.log(`Pay btc from ${from} to ${to.address} amount ${amount}`)
  await btcPayer.pay(from, to, amount)
}

async function main() {
  console.log('Init')
  await init()

  console.log('Create accounts')
  await createAccounts()

  console.log('Mint USDT')
  await mintTokens(USDT_ADDRESS)

  console.log('Mint USDC')
  await mintTokens(USDC_ADDRESS)

  console.log('Pay ETH manually')
  await payEthManually(accounts[1], accounts[0], 1)

  const count = 2

  console.log(`Pay random ETH amount ${count} times`)
  for (var i = 0; i < count; i++) {
    const amount = randomIntFromInterval(1, 10)
    await payEth(accounts[1], accounts[0], amount)
  }

  console.log(`Pay random USDT amount ${count} times`)
  for (var i = 0; i < count; i++) {
    const amount = randomIntFromInterval(10, 100)
    await payToken(accounts[1], accounts[0], amount, USDT_ADDRESS)
  }

  console.log('Withdraw ETH')
  await withdrawEth(accounts[0], 1)

  console.log('Withdraw USDT')
  await withdrawToken(accounts[0], 10, USDT_ADDRESS)

  console.log(`Pay random BTC amount ${count} times`)
  for (var i = 0; i < count; i++) {
    const amountBtc = randomIntFromInterval(1, 100) / 1000
    await payBtc(process.env.SEED_BTC_WALLET_FROM as string, accounts[0], amountBtc)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
