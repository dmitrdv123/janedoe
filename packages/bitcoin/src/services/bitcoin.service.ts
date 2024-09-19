import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress } from '@repo/dao/dist/src/interfaces/bitcoin'

import { BitcoinCoreService } from './bitcoin-core.service'
import { BitcoinUtilsService } from './bitcoin-utils.service'
import { BITCOIN_DECIMALS } from '../constants'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'
import { parseToBigNumber } from '../utils/bitcoin-utils'

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
      throw new BitcoinCoreError(-6, `UTXOs to withdraw not found`)
    }

    const walletAddresses = await this.bitcoinDao.loadWalletAddresses(
      utxos.map(utxo => ({
        walletName, label: utxo.label
      }))
    )
    if (walletAddresses.length === 0) {
      throw new BitcoinCoreError(-4, `Wallets for UTXOs not found`)
    }

    const utxosFiltered = utxos.reduce((acc, utxo) => {
      const exist = walletAddresses.findIndex(
        item => item.data.address.toLocaleLowerCase() === utxo.data.address.toLocaleLowerCase()
      ) !== -1
      if (exist) {
        acc.push(utxo)
      }

      return acc
    }, [] as BitcoinUtxo[])
    if (utxosFiltered.length === 0) {
      throw new BitcoinCoreError(-6, `UTXOs to withdraw not found`)
    }

    const amount = utxosFiltered.reduce(
      (acc, utxoData) => acc + parseToBigNumber(utxoData.data.amount, BITCOIN_DECIMALS), BigInt(0)
    )

    const addressRest = await this.getWalletAddressForRest(walletName)
    return await this.createTransaction(walletAddresses, utxosFiltered, address, addressRest, amount)
  }

  public async refund(walletName: string, utxoKey: BitcoinUtxoDataKey, address: string, amount: string): Promise<string | undefined> {
    const utxo = await this.bitcoinDao.loadUtxo(utxoKey, true)
    if (!utxo) {
      throw new BitcoinCoreError(-6, `UTXO to refund not found`)
    }

    const walletAddress = await this.bitcoinDao.loadWalletAddress(walletName, utxo.label)
    if (!walletAddress) {
      throw new BitcoinCoreError(-4, `Wallet for UTXO not found`)
    }

    const addressRest = await this.getWalletAddressForRest(walletName)
    return await this.createTransaction([walletAddress], [utxo], address, addressRest, BigInt(amount))
  }

  private async createTransaction(walletAddresses: BitcoinWalletAddress[], utxos: BitcoinUtxo[], address: string, addressRest: string, amount: bigint): Promise<string | undefined> {
    const feeRate = await this.bitcoinDao.loadFeeRate()
    if (!feeRate) {
      throw new Error('Fee rate not found')
    }

    const walletAddressesData = walletAddresses.map(item => item.data)
    const utxosData = utxos.map(item => item.data)

    const tx = this.bitcoinUtilsService.createTransaction(walletAddressesData, utxosData, feeRate, address, addressRest, amount)
    await this.bitcoinCoreService.sendTransaction(tx)
    await this.bitcoinDao.saveUtxos(utxos, false)

    return tx.getId()
  }

  private async getWalletAddressForRest(walletName: string): Promise<string> {
    const walletAddressRest = await this.createWalletAddress(walletName, `rest_${walletName}`)
    return walletAddressRest.data.address
  }
}
