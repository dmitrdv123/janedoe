import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress, BitcoinWalletAddressKey } from '@repo/dao/dist/src/interfaces/bitcoin'

import appConfig from '@repo/common/dist/src/app-config'
import { TransactionCreationResult } from '@repo/common/dist/src/interfaces/transaction-creation-result'

import { BitcoinCoreService } from './bitcoin-core.service'
import { BitcoinUtilsService } from './bitcoin-utils.service'
import { BITCOIN_DECIMALS, BITCOIN_DUST_AMOUNT, BITCOIN_DUST_AMOUNT_SATOSHI } from '../constants'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'
import { convertBigIntToFloat, parseToBigNumber, totalAmountUtxos, tryParseFloat } from '../utils/bitcoin-utils'

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
    const utxos = await this.bitcoinDao.listWalletUtxos(walletName)
    const totalAmount = totalAmountUtxos(utxos.map(utxo => utxo.data))
    return convertBigIntToFloat(totalAmount, BITCOIN_DECIMALS)
  }

  public async getWalletAddressBalance(walletName: string, label: string): Promise<number> {
    const utxos = await this.bitcoinDao.listWalletAddressUtxos(walletName, label)
    const totalAmount = totalAmountUtxos(utxos.map(utxo => utxo.data))
    return convertBigIntToFloat(totalAmount, BITCOIN_DECIMALS)
  }

  public async withdraw(walletName: string, address: string, amount: string): Promise<TransactionCreationResult> {
    console.log(`debug >> BitcoinService: start to withdraw amount ${amount}`)

    const requiredAmount = BigInt(amount)
    if (requiredAmount <= BITCOIN_DUST_AMOUNT_SATOSHI) {
      throw new BitcoinCoreError(-6, `Transaction amount ${requiredAmount.toString()} is less or equal than limit ${BITCOIN_DUST_AMOUNT_SATOSHI} and could not be used due to network rules.`)
    }

    console.log(`debug >> BitcoinService: list utxos`)
    let utxos = await this.bitcoinDao.listWalletUtxos(walletName)
    if (utxos.length === 0) {
      throw new BitcoinCoreError(-6, `UTXOs to withdraw not found.`)
    }

    utxos = utxos.filter(utxo => utxo.data.amount > BITCOIN_DUST_AMOUNT)
    if (utxos.length === 0) {
      throw new BitcoinCoreError(-6, `All UTXOs are less or equal than limit ${BITCOIN_DUST_AMOUNT} and could not be used due to network rules.`)
    }

    utxos = utxos.filter(utxo => utxo.data.frozen <= 0)
    if (utxos.length === 0) {
      throw new BitcoinCoreError(-6, `All UTXOs are in use in unconfirmed transactions, wait next block and try again.`)
    }

    console.log(`debug >> BitcoinService: load wallet addresses`)
    const walletAddressKeys: BitcoinWalletAddressKey[] = Array
      .from(new Set(utxos.map(utxo => utxo.label)))
      .map(label => ({ walletName, label }))

    const walletAddresses = await this.bitcoinDao.loadWalletAddresses(walletAddressKeys)
    if (walletAddresses.length === 0) {
      throw new BitcoinCoreError(-4, `Wallets for UTXOs not found.`)
    }
    console.log(JSON.stringify(walletAddresses))

    utxos = utxos.filter(utxo => walletAddresses.findIndex(
      item => item.data.address.toLocaleLowerCase() === utxo.data.address.toLocaleLowerCase()
    ) !== -1)
    if (utxos.length === 0) {
      throw new BitcoinCoreError(-6, `UTXOs to withdraw not found.`)
    }

    console.log(`debug >> BitcoinService: start to iterate over utxo`)
    const selectedUtxos: BitcoinUtxo[] = []
    const selectedUtxosFrozen: number[] = []
    let restAmount = BigInt(amount)
    for (const utxo of utxos) {
      console.log(JSON.stringify(utxo))

      const utxoAmount = parseToBigNumber(utxo.data.amount, BITCOIN_DECIMALS) - parseToBigNumber(utxo.data.frozen, BITCOIN_DECIMALS)
      const frozenUtxoAmount = utxoAmount > restAmount ? restAmount : utxoAmount

      selectedUtxos.push(utxo)
      selectedUtxosFrozen.push(convertBigIntToFloat(frozenUtxoAmount, BITCOIN_DECIMALS))

      restAmount -= frozenUtxoAmount
      if (restAmount <= BigInt(0)) {
        console.log(`debug >> BitcoinService: finish to iterate over utxo}`)
        break
      }
    }
    if (restAmount > BigInt(0)) {
      throw new BitcoinCoreError(-6, `Not enough funds in wallet.`)
    }

    const chunk = parseInt(appConfig.BITCOIN_TRANSACTION_INPUTS_MAX)
    const selectedChunkUtxos = selectedUtxos.slice(0, chunk)
    console.log(JSON.stringify(selectedChunkUtxos))

    const selectedChunkUtxosAmount = totalAmountUtxos(selectedChunkUtxos.map(utxo => utxo.data))
    const withdrawAmount = selectedChunkUtxosAmount >= requiredAmount ? requiredAmount : selectedChunkUtxosAmount

    console.log(`debug >> BitcoinService: get wallet address for rest`)
    const addressRest = await this.getWalletAddressForRest(walletName)

    console.log(`debug >> BitcoinService: create tx`)
    console.log(`debug >> BitcoinService: walletAddresses`)
    console.log(JSON.stringify(walletAddresses))
    console.log(`debug >> BitcoinService: selectedChunkUtxos`)
    console.log(JSON.stringify(selectedChunkUtxos))
    console.log(`debug >> BitcoinService: address`)
    console.log(address)
    console.log(`debug >> BitcoinService: addressRest`)
    console.log(addressRest)
    console.log(`debug >> BitcoinService: withdraw amount`)
    console.log(withdrawAmount)

    const transaction = await this.createTransaction(walletAddresses, selectedChunkUtxos, address, addressRest, withdrawAmount)

    await Promise.all(
      selectedChunkUtxos.map(async (utxo, i) => {
        await this.bitcoinDao.updateUtxoFrozen(utxo.data, selectedUtxosFrozen[i])
      })
    )

    return selectedUtxos.length > chunk
      ? {
        transaction,
        index: 0,
        message: `Part amount ${withdrawAmount.toString()} of ${amount.toString()} was used because input UTXOs count ${selectedUtxos.length} exceed limit ${chunk}. Submit another transactions to use the rest.`,
        code: 'services.errors.bitcoin_errors.transaction_inputs_limit_exceed',
        args: { amount: amount.toString(), withdraw: withdrawAmount.toString(), count: `${selectedUtxos.length}`, limit: `${chunk}` }
      }
      : {
        transaction,
        index: 0,
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

    const walletAddressesData = walletAddresses.map(item => item.data)
    const utxosData = utxos.map(item => item.data)

    const tx = this.bitcoinUtilsService.createTransaction(walletAddressesData, utxosData, feeRate, address, addressRest, amount)
    await this.bitcoinCoreService.sendTransaction(tx)

    return tx.getId()
  }

  private async getWalletAddressForRest(walletName: string): Promise<string> {
    const walletAddressRest = await this.createWalletAddress(walletName, `rest_${walletName}`)
    return walletAddressRest.data.address
  }
}
