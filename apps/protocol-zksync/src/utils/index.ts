import * as hre from 'hardhat'
import * as fs from 'fs'

import path from 'path'
import { Addressable } from 'ethers'
import { Deployer } from '@matterlabs/hardhat-zksync'
import { Provider } from 'zksync-ethers'

import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import { RangoWrapperService } from '@repo/common/dist/src/services/rango-wrapper-service'

import { NetworkInfo } from '../interfaces'

export async function deployUpgradable(deployer: Deployer, name: string, args: unknown[] = [], initializer: string = 'initialize') {
  console.log(`Deploying ${name}...`)

  const contract = await deployer.loadArtifact(name)
  const contractProxy = await hre.zkUpgrades.deployProxy(deployer.zkWallet, contract, args, { initializer })
  await contractProxy.waitForDeployment()

  const constractProxyAddress = await contractProxy.getAddress()
  console.log(`Contract ${name} deployed to ${constractProxyAddress} with args ${JSON.stringify(args)}`)

  return constractProxyAddress
}

export async function upgrade(deployer: Deployer, name: string, address: string | Addressable, fn: string, args?: unknown[]) {
  console.log(`Deploying ${name}...`)

  const contract = await deployer.loadArtifact(name)
  const contractProxy = await hre.zkUpgrades.upgradeProxy(deployer.zkWallet, address, contract, { call: { fn, args } })

  const constractProxyAddress = await contractProxy.getAddress()
  console.log(`Contract ${name} deployed to ${constractProxyAddress} with args ${JSON.stringify(args)}`)

  return constractProxyAddress
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
  const network = await getProvider().getNetwork()

  const chainId = Number(network.chainId)
  const hexChainId = `0x${chainId.toString(16)}`

  const rangoWrapperService = commonContainer.resolve<RangoWrapperService>('rangoWrapperService')
  const meta = await rangoWrapperService.meta()
  const blockchain = meta.blockchains.find(item => item.chainId === hexChainId)

  const name = blockchain?.name.toLocaleLowerCase() ?? hre.network.name.toLocaleLowerCase()

  return { name, chainId, hexChainId }
}

export function getProvider(): Provider {
  const rpcUrl = hre.network.config.url
  if (!rpcUrl) {
    throw `RPC URL wasn't found in "${hre.network.name}"! Please add a "url" field to the network config in hardhat.config.ts`
  }

  return new Provider(rpcUrl)
}
