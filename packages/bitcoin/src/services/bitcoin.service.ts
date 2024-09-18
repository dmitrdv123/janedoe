import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress } from '@repo/dao/dist/src/interfaces/bitcoin'

import { BitcoinCoreService } from './bitcoin-core.service'
import { BitcoinUtilsService } from './bitcoin-utils.service'
import { BITCOIN_DECIMALS, BITCOIN_DUST_AMOUNT, BITCOIN_DUST_AMOUNT_SATOSHI } from '../constants'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'
import { convertBigIntToFloat, parseToBigNumber } from '../utils/bitcoin-utils'

export interface BitcoinService {
  createWallet(walletName: string): Promise<BitcoinWallet>
  createWalletAddress(walletName: string, label: string): Promise<BitcoinWallet>

  getWalletBalance(walletName: string): Promise<number>
  getWalletAddressBalance(walletName: string, label: string): Promise<number>

  withdraw(walletName: string, address: string): Promise<string | undefined>
  refund(walletName: string, utxoKey: BitcoinUtxoDataKey, address: string, amount: string): Promise<string | undefined>
}

export class BitcoinServiceImpl implements BitcoinService {
  public constructor(
    private bitcoinCoreService: BitcoinCoreService,
    private bitcoinUtilsService: BitcoinUtilsService,
    private bitcoinDao: BitcoinDao
  ) { }

  public async createWallet(walletName: string): Promise<BitcoinWallet> {
    const existedWallet = await this.bitcoinDao.loadWallet(walletName)
    if (existedWallet) {
      return existedWallet
    }

    const wallet: BitcoinWallet = {
      walletName,
      data: this.bitcoinUtilsService.generateRootWallet()
    }

    await this.bitcoinDao.saveWallet(wallet)

    return wallet
  }

  public async createWalletAddress(walletName: string, label: string): Promise<BitcoinWalletAddress> {
    const existedWalletAddress = await this.bitcoinDao.loadWalletAddress(walletName, label)
    if (existedWalletAddress) {
      return existedWalletAddress
    }

    const wallet = await this.bitcoinDao.loadWallet(walletName)
    if (!wallet) {
      throw new Error(`Wallet ${walletName} not found`)
    }

    const walletAddressIndex: number = await this.bitcoinDao.updateWalletAddressCounter(walletName)

    const walletAddress: BitcoinWalletAddress = {
      walletName,
      label,
      data: this.bitcoinUtilsService.generateChildWallet(wallet.data, walletAddressIndex)
    }

    await this.bitcoinDao.saveWalletAddress(walletAddress)

    return walletAddress
  }

  public async getWalletBalance(walletName: string): Promise<number> {
    return await this.bitcoinDao.loadWalletBalance(walletName)
  }

  public async getWalletAddressBalance(walletName: string, label: string): Promise<number> {
    return await this.bitcoinDao.loadWalletAddressBalance(walletName, label)
  }

  public async withdraw(walletName: string, address: string): Promise<string | undefined> {
    const utxos = await this.bitcoinDao.listWalletUtxos(walletName, true)
    if (utxos.length === 0) {
      return undefined
    }

    const utxosFiltered = utxos.filter(utxo => utxo.data.amount > BITCOIN_DUST_AMOUNT)
    if (utxosFiltered.length === 0) {
      throw new BitcoinCoreError(-26, `All input UTXOs is less or equal limit ${BITCOIN_DUST_AMOUNT} and could not be withdraw due to network rules`)
    }

    const walletAddresses = await this.bitcoinDao.loadWalletAddresses(
      utxosFiltered.map(utxo => ({
        walletName, label: utxo.label
      }))
    )
    if (walletAddresses.length === 0) {
      return undefined
    }

    const utxosFilteredByWalletAddresses = utxosFiltered.reduce((acc, utxo) => {
      const exist = walletAddresses.findIndex(
        item => item.data.address.toLocaleLowerCase() === utxo.data.address.toLocaleLowerCase()
      ) !== -1
      if (exist) {
        acc.push(utxo)
      }

      return acc
    }, [] as BitcoinUtxo[])
    if (utxosFilteredByWalletAddresses.length === 0) {
      return undefined
    }

    const amount = utxosFilteredByWalletAddresses.reduce(
      (acc, utxoData) => acc + parseToBigNumber(utxoData.data.amount, BITCOIN_DECIMALS), BigInt(0)
    )

    return await this.createTransaction(walletAddresses, utxosFilteredByWalletAddresses, address, walletAddresses[0].data.address, amount)
  }

  public async refund(walletName: string, utxoKey: BitcoinUtxoDataKey, address: string, amount: string): Promise<string | undefined> {
    const utxo = await this.bitcoinDao.loadUtxo(utxoKey, true)
    if (!utxo) {
      throw new BitcoinCoreError(-6, `UTXO to refund not found`)
    }

    const walletAddress = await this.bitcoinDao.loadWalletAddress(walletName, utxo.label)
    if (!walletAddress) {
      return undefined
    }

    return await this.createTransaction([walletAddress], [utxo], address, walletAddress.data.address, BigInt(amount))
  }

  private async createTransaction(walletAddresses: BitcoinWalletAddress[], utxos: BitcoinUtxo[], address: string, addressRest: string, amount: bigint): Promise<string | undefined> {
    const feeRate = await this.bitcoinDao.loadFeeRate()
    if (!feeRate) {
      throw new Error('Fee rate not found')
    }

    const walletAddressesData = walletAddresses.map(item => item.data)
    const utxosData = utxos.map(item => item.data)

    const estimateFeeTx = this.bitcoinUtilsService.createTransaction(walletAddressesData, utxosData, feeRate, address, addressRest, amount, true)
    const fee = BigInt(Math.ceil(estimateFeeTx.virtualSize() * feeRate))
    const outputValue = amount - fee
    if (outputValue <= BITCOIN_DUST_AMOUNT_SATOSHI) {
      throw new BitcoinCoreError(-26, `Output amount after extracting network fee is less or equal limit ${BITCOIN_DUST_AMOUNT} and could not be withdraw due to network rules`)
    }

    console.log(`debug >> amount ${amount}`)
    console.log(`debug >> feeRate ${feeRate}`)
    console.log(`debug >> estimateFeeTx.virtualSize() ${estimateFeeTx.virtualSize()}`)
    console.log(`debug >> fee ${fee}`)
    console.log(`debug >> outputValue ${outputValue}`)

    const tx = this.bitcoinUtilsService.createTransaction(walletAddressesData, utxosData, feeRate, address, addressRest, outputValue)
    await this.bitcoinCoreService.sendTransaction(tx)
    await this.bitcoinDao.saveUtxos(utxos, false)

    return tx.getId()
  }
}
