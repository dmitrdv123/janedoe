import * as hre from 'hardhat'

import { Deployer } from '@matterlabs/hardhat-zksync'
import { parseFixed } from '@ethersproject/bignumber'
import { nanoid } from 'nanoid'
import { formatUnits, hexlify, toUtf8Bytes } from 'ethers'
import { Wallet } from 'zksync-ethers'

import { AppSettingsContracts } from '@repo/dao/dist/src/interfaces/settings'

import { getNetworkInfo, loadFileAsJson } from '../src/utils'
import { DEPLOYMENTS_FOLDER } from '../src/constants'
import { JaneDoe, JaneDoe__factory } from '../typechain-types'

async function printBalance(contractJaneDoe: JaneDoe, address: string, tokenId: string) {
  const balance = await contractJaneDoe.balanceOf(address, tokenId)
  console.log(`Balance of ${address}: ${formatUnits(balance, 18)} ETH`)
}

async function payEth(contractJaneDoe: JaneDoe, contractSettings: AppSettingsContracts, from: string, to: string, amount: number) {
  console.log(`Start to pay ${amount} ETH from ${from} to ${to}`)

  const paymentId = hexlify(toUtf8Bytes(nanoid()))
  const tokenId = contractSettings.contractAddresses.WrappedNative

  await printBalance(contractJaneDoe, to, tokenId)

  console.log(`Start paying with payment id ${paymentId} and token id ${tokenId}`)
  const response = await contractJaneDoe.payNativeFrom(
    from,
    to,
    paymentId,
    {
      value: parseFixed(amount.toString(), 18).toString()
    }
  )

  console.log('Waiting transaction')
  await response.wait()

  await printBalance(contractJaneDoe, to, tokenId)

  console.log('End to pay')
}

async function withdrawEth(contractJaneDoe: JaneDoe, contractSettings: AppSettingsContracts, address: string) {
  console.log(`Start to withdraw for ${address}`)

  const tokenId = contractSettings.contractAddresses.WrappedNative

  await printBalance(contractJaneDoe, address, tokenId)

  const balance = await contractJaneDoe.balanceOf(address, tokenId)

  console.log(`Withdrawing ${formatUnits(balance, 18)}`)
  const response = await contractJaneDoe.withdrawEthTo(address, balance)

  console.log('Waiting transaction')
  await response.wait()

  await printBalance(contractJaneDoe, address, tokenId)

  console.log('End to withdraw')
}

async function main() {
  const networkInfo = await getNetworkInfo()

  const signerPrivateKey = process.env.SIGNER
  if (!signerPrivateKey) {
    throw new Error('Some of env vars CONTRACT, VERSION, INIT, SIGNER are not set')
  }

  const deploymentFile = `${DEPLOYMENTS_FOLDER}/${networkInfo.name.toLocaleLowerCase()}.json`
  const contractSettings = await loadFileAsJson<AppSettingsContracts>(deploymentFile)
  if (!contractSettings) {
    throw new Error(`Cannot find file ${deploymentFile}`)
  }

  const wallet = new Wallet(signerPrivateKey)
  const deployer = new Deployer(hre, wallet)
  const contractJaneDoe = JaneDoe__factory.connect(contractSettings.contractAddresses.JaneDoe, deployer.zkWallet)

  const from = wallet.address
  const to = wallet.address
  const amount = 0.0001

  await payEth(contractJaneDoe, contractSettings, from, to, amount)
  await withdrawEth(contractJaneDoe, contractSettings, to)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
