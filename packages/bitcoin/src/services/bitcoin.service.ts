import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress, BitcoinWalletAddressKey } from '@repo/dao/dist/src/interfaces/bitcoin'

import appConfig from '@repo/common/dist/src/app-config'
import { TransactionCreationResult } from '@repo/common/dist/src/interfaces/transaction-creation-result'

import { BitcoinCoreService } from './bitcoin-core.service'
import { BitcoinUtilsService } from './bitcoin-utils.service'
import { BITCOIN_DECIMALS, BITCOIN_DUST_AMOUNT } from '../constants'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'
import { parseToBigNumber, tryParseFloat } from '../utils/bitcoin-utils'

export interface BitcoinService {
  createWallet(walletName: string): Promise<BitcoinWallet>
  createWalletAddress(walletName: string, label: string): Promise<BitcoinWallet>

  getWalletBalance(walletName: string): Promise<number>
  getWalletAddressBalance(walletName: string, label: string): Promise<number>

  withdraw(walletName: string, address: string, amount: string): Promise<TransactionCreationResult>
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

  public async withdraw(walletName: string, address: string, amount: string): Promise<TransactionCreationResult> {
    console.log(`debug >> BitcoinService: start to withdraw amount ${amount}`)

    const requiredAmount = BigInt(amount)

    console.log(`debug >> BitcoinService: list utxos`)
    const utxos = await this.bitcoinDao.listWalletUtxos(walletName, true)
    if (utxos.length === 0) {
      throw new BitcoinCoreError(-6, `UTXOs to withdraw not found`)
    }
    console.log(JSON.stringify(utxos))

    console.log(`debug >> BitcoinService: load wallet addresses`)
    const walletAddressKeys: BitcoinWalletAddressKey[] = Array
      .from(new Set(utxos.map(utxo => utxo.label)))
      .map(label => ({ walletName, label }))

    const walletAddresses = await this.bitcoinDao.loadWalletAddresses(walletAddressKeys)
    if (walletAddresses.length === 0) {
      throw new BitcoinCoreError(-4, `Wallets for UTXOs not found`)
    }
    console.log(JSON.stringify(walletAddresses))

    console.log(`debug >> BitcoinService: start to iterate over utxo`)
    const selectedUtxos: BitcoinUtxo[] = []
    let totalAmount = BigInt(0)
    for (const utxo of utxos) {
      console.log(JSON.stringify(utxo))

      if (utxo.data.amount <= BITCOIN_DUST_AMOUNT) {
        console.log(`debug >> BitcoinService: skip utxo amount ${utxo.data.amount} is less BITCOIN_DUST_AMOUNT ${BITCOIN_DUST_AMOUNT}`)
        continue
      }

      const exist = walletAddresses.findIndex(
        item => item.data.address.toLocaleLowerCase() === utxo.data.address.toLocaleLowerCase()
      ) !== -1
      if (!exist) {
        console.log(`debug >> BitcoinService: skip utxo because wallet address ${utxo.data.address} not exist`)
        continue
      }

      selectedUtxos.push(utxo)
      totalAmount += parseToBigNumber(utxo.data.amount, BITCOIN_DECIMALS)

      if (totalAmount >= requiredAmount) {
        console.log(`debug >> BitcoinService: finish to iterate over utxo because totalAmount ${totalAmount.toString()} >= requiredAmount  ${requiredAmount.toString()}`)
        break
      }
    }
    if (totalAmount < requiredAmount) {
      throw new BitcoinCoreError(-6, `Not enough funds in wallet`)
    }
    if (selectedUtxos.length === 0) {
      throw new BitcoinCoreError(-6, `UTXOs to withdraw not found or all input UTXO amounts is less or equal limit ${BITCOIN_DUST_AMOUNT} and could not be withdraw due to network rules`)
    }

    const chunk = parseInt(appConfig.BITCOIN_TRANSACTION_INPUTS_MAX)
    const selectedUtxosChunk = selectedUtxos.slice(0, chunk)
    const selectedUtxosAmount = selectedUtxosChunk.reduce(
      (acc, utxoData) => acc + parseToBigNumber(utxoData.data.amount, BITCOIN_DECIMALS), BigInt(0)
    )
    const withdrawAmount = selectedUtxosAmount >= requiredAmount ? requiredAmount : selectedUtxosAmount

    console.log(`debug >> BitcoinService: get wallet address for rest`)
    const addressRest = await this.getWalletAddressForRest(walletName)

    console.log(`debug >> BitcoinService: create tx`)
    console.log(`debug >> BitcoinService: walletAddresses`)
    console.log(JSON.stringify(walletAddresses))
    console.log(`debug >> BitcoinService: selectedUtxosChunk`)
    console.log(JSON.stringify(selectedUtxosChunk))
    console.log(`debug >> BitcoinService: address`)
    console.log(address)
    console.log(`debug >> BitcoinService: addressRest`)
    console.log(addressRest)
    console.log(`debug >> BitcoinService: withdraw amount`)
    console.log(withdrawAmount)

    const txId = await this.createTransaction(walletAddresses, selectedUtxosChunk, address, addressRest, withdrawAmount)

    return selectedUtxos.length > chunk
      ? {
        txId,
        message: `UTXOs count ${utxos.length} exceed limit ${chunk} and will be splitted. Submit another transactions to use another ones.`,
        code: 'services.errors.bitcoin_errors.transaction_inputs_limit_exceed',
        args: { count: `${utxos.length}`, limit: `${chunk}` }
      }
      : {
        txId,
        message: '',
        code: '',
        args: {}
      }
  }

  private async createTransaction(walletAddresses: BitcoinWalletAddress[], utxos: BitcoinUtxo[], address: string, addressRest: string, amount: bigint): Promise<string> {
    let feeRate = await this.bitcoinDao.loadFeeRate()
    if (!feeRate) {
      feeRate = tryParseFloat(appConfig.BITCOIN_DEFAULT_FEE_RATE)
    }
    if (!feeRate) {
      throw new Error('Fee rate not found')
    }

    console.log(`debug >> BitcoinService: BITCOIN_TRANSACTION_INPUTS_MAX ${appConfig.BITCOIN_TRANSACTION_INPUTS_MAX}`)

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
