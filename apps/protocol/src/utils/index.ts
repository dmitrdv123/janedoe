import * as fs from 'fs'
import * as crypto from 'crypto'
import path from 'path'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { getContractAddress } from '@openzeppelin/hardhat-upgrades/dist/utils'
import { Addressable, formatUnits, hexlify, toUtf8Bytes } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { customAlphabet } from 'nanoid'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import appConfig from '@repo/common/dist/src/app-config'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import { RangoWrapperService } from '@repo/common/dist/src/services/rango-wrapper-service'

import { IERC20Metadata__factory, IERC20__factory, JaneDoe, WrappedNative } from '../../typechain-types'
import { ETH_DECIMALS } from '../constants'
import { NetworkInfo } from '../interfaces'

export async function deploy(signer: HardhatEthersSigner, name: string, args: unknown[] = []): Promise<string> {
  const contract = await ethers.deployContract(name, args, { signer })
  await contract.waitForDeployment()
  console.log(`Contract ${name} deployed by ${signer.address} to ${contract.target}`)

  return await getContractAddress(contract.target)
}

export async function deployUpgradable(signer: HardhatEthersSigner, name: string, args: unknown[] = []): Promise<string> {
  const factory = await ethers.getContractFactory(name, signer)
  const contract = await upgrades.deployProxy(factory, args)
  await contract.waitForDeployment()

  console.log(`Contract ${name} deployed by ${signer.address} to ${contract.target} with args ${JSON.stringify(args)}`)

  return await getContractAddress(contract.target)
}

export async function upgrade(signer: HardhatEthersSigner, name: string, address: string | Addressable, fn?: string, args?: unknown[]): Promise<string> {
  const opts = fn
    ? {
      call: {
        args, fn
      }
    }
    : undefined

  const factory = await ethers.getContractFactory(name, signer)
  const contract = await upgrades.upgradeProxy(address, factory, opts)
  await contract.waitForDeployment()

  console.log(`Contract ${name} deployed by ${signer.address} to ${contract.target}`)

  return await getContractAddress(contract.target)
}

export async function printBalances(account: HardhatEthersSigner, erc20Address: string) {
  const erc20 = IERC20__factory.connect(erc20Address, account)
  const erc20Metadata = IERC20Metadata__factory.connect(erc20Address, account)

  const [symbol, decimals, balance, balanceUsdt] = await Promise.all([
    erc20Metadata.symbol(),
    erc20Metadata.decimals(),
    ethers.provider.getBalance(account.address),
    erc20.balanceOf(account.address)
  ])

  console.log(`${account.address} balances: ${formatUnits(balance, ETH_DECIMALS)} ETH, ${formatUnits(balanceUsdt, decimals)} ${symbol}`)
}

export async function printBalancesEth(account: HardhatEthersSigner, contractJanedoe: JaneDoe, contractWrappedNative: WrappedNative): Promise<void> {
  const balanceEth = await ethers.provider.getBalance(account.address)

  const tokenId = contractWrappedNative.target.toString()
  const balanceJanedoe = await contractJanedoe.connect(account).balanceOf(account.address, tokenId)

  console.log(`${account.address} balance: ${formatUnits(balanceEth, ETH_DECIMALS)} ETH, janedoe balance: ${formatUnits(balanceJanedoe, ETH_DECIMALS)} ETH`)
}

export async function printBalancesToken(account: HardhatEthersSigner, contractJanedoe: JaneDoe, erc20Address: string): Promise<void> {
  const erc20 = IERC20__factory.connect(erc20Address, account)
  const erc20Metadata = IERC20Metadata__factory.connect(erc20Address, account)

  const tokenId = erc20Address

  const [symbol, decimals, balance, balanceJanedoe] = await Promise.all([
    erc20Metadata.symbol(),
    erc20Metadata.decimals(),
    erc20.balanceOf(account.address),
    contractJanedoe.connect(account).balanceOf(account.address, tokenId)
  ])

  console.log(`${account.address} balance: ${formatUnits(balance, decimals)} ${symbol}, janedoe balance: ${formatUnits(balanceJanedoe, decimals)} ${symbol}`)
}

export async function generatePaymentIdForEvm(address: string, accountDao: AccountDao) {
  const accountProfile = await accountDao.loadAccountProfileByAddress(address)
  if (!accountProfile) {
    throw new Error(`Generate payment id for evm failed. Account not found for address ${address}`)
  }

  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz')
  const paymentId = nanoid(11)

  return hexlify(toUtf8Bytes(accountProfile.id + paymentId))
}

export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(appConfig.JWT_ENCRYPTION_KEY as string), Buffer.from(appConfig.JWT_INIT_VECTOR as string))
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

export function existFile(dir: string, file: string): boolean {
  const fullDir = path.join(process.cwd(), dir)
  const filePath = path.join(fullDir, file)
  return fs.existsSync(filePath)
}

export async function saveFile<T>(dir: string, file: string, data: T): Promise<void> {
  const fullDir = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullDir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  const filePath = path.join(fullDir, file)
  const str = JSON.stringify(data, (_key, value) => typeof value === 'bigint' ? value.toString() : value)
  await fs.promises.writeFile(filePath, str)
}

export async function loadFileAsJson<T>(file: string): Promise<T | undefined> {
  const data = await loadFile(file)
  return data === undefined ? undefined : JSON.parse(data)
}

export async function loadFile(file: string): Promise<string | undefined> {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    return undefined
  }

  return await fs.promises.readFile(filePath, 'utf-8')
}

export async function removeFile(file: string): Promise<void> {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    await fs.promises.rm(filePath)
  }
}

export async function getNetworkInfo(): Promise<NetworkInfo> {
  const network = await ethers.provider.getNetwork()

  const chainId = Number(network.chainId)
  const hexChainId = `0x${chainId.toString(16)}`

  let name: string = ''
  if (network.name.toLocaleLowerCase() === 'localhost' || network.name.toLocaleLowerCase() === 'hardhat') {
    name = 'hardhat'
  } else {
    const rangoWrapperService = commonContainer.resolve<RangoWrapperService>('rangoWrapperService')
    const meta = await rangoWrapperService.meta()
    const blockchain = meta.blockchains.find(item => item.chainId === hexChainId)
    if (!blockchain) {
      throw new Error(`Cannot find blockchain ${hexChainId} in meta`)
    }

    name = blockchain.name.toLocaleLowerCase()
  }

  return { name, chainId, hexChainId }
}
