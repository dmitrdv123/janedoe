import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinUtxoData, BitcoinWallet, BitcoinWalletAddress } from '@repo/dao/dist/src/interfaces/bitcoin'

import { BitcoinCoreService } from './bitcoin-core.service'
import { BitcoinUtilsService } from './bitcoin-utils.service'

export interface BitcoinService {
  createWallet(walletName: string): Promise<BitcoinWallet>
  createWalletAddress(walletName: string, label: string): Promise<BitcoinWallet>

  getWalletBalance(walletName: string): Promise<number>
  getWalletAddressBalance(walletName: string, label: string): Promise<number>

  withdraw(walletName: string, address: string): Promise<string | undefined>
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
    const wallet = await this.bitcoinDao.loadWallet(walletName)
    if (!wallet) {
      throw new Error(`Wallet ${walletName} not found`)
    }

    const feeRate = await this.bitcoinDao.loadFeeRate()
    if (!feeRate) {
      throw new Error('Fee rate not found')
    }

    const utxos = await this.bitcoinDao.listWalletUtxos(walletName, true)
    if (utxos.length === 0) {
      return undefined
    }

    const walletAddresses = await this.bitcoinDao.loadWalletAddresses(utxos.map(utxo => ({
      walletName, label: utxo.label
    })))
    const walletAddressesData = walletAddresses.map(item => item.data)
    if (walletAddressesData.length === 0) {
      return undefined
    }

    const utxosDataFiltered = utxos.reduce((acc, utxo) => {
      const exist = walletAddressesData.findIndex(
        item => item.address.toLocaleLowerCase() === utxo.data.address.toLocaleLowerCase()
      ) !== -1
      if (exist) {
        acc.push(utxo.data)
      }

      return acc
    }, [] as BitcoinUtxoData[])
    if (utxosDataFiltered.length === 0) {
      return undefined
    }

    const tx = this.bitcoinUtilsService.createTransaction(walletAddressesData, utxosDataFiltered, address, feeRate)
    await this.bitcoinCoreService.sendTransaction(tx)
    await this.bitcoinDao.saveUtxos(utxos, false)

    return tx.getId()
  }
}
