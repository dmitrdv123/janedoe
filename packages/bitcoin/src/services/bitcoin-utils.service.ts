import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'

import { BIP32Factory } from 'bip32'
import ECPairFactory from 'ecpair'

import { BitcoinUtxoData, BitcoinWalletAddressData, BitcoinWalletAmount, BitcoinWalletData } from '@repo/dao/dist/src/interfaces/bitcoin'
import { parseBigIntToNumber, parseToBigNumber, totalAmountUtxos } from '../utils/bitcoin-utils'
import { BITCOIN_DECIMALS, BITCOIN_DUST_AMOUNT_SATOSHI } from '../constants'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'

export interface BitcoinUtilsService {
  generateRootWallet(): BitcoinWalletData
  generateChildWallet(rootWalletData: BitcoinWalletData, index: number): BitcoinWalletAddressData
  createTransaction(walletAddressData: BitcoinWalletAddressData[], utxosData: BitcoinUtxoData[], feeRate: number, address: string, addressRest: string, value: bigint, disableFeeCheck?: boolean): bitcoin.Transaction
}

export class BitcoinUtilsServiceImpl implements BitcoinUtilsService {
  public constructor(
    private network?: bitcoin.networks.Network | undefined
  ) { }

  public generateRootWallet(): BitcoinWalletData {
    const factory = ECPairFactory(ecc)
    const keyPair = factory.makeRandom()
    const wif = keyPair.toWIF()

    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.network })
    if (!address) {
      throw new Error('P2WPKH does not have a address')
    }

    return { wif, address }
  }

  public generateChildWallet(rootWalletData: BitcoinWalletData, index: number): BitcoinWalletAddressData {
    const factory = ECPairFactory(ecc)
    const keyPair = factory.fromWIF(rootWalletData.wif) // for some reason it failed with this.network arg, at least for regtest

    if (!keyPair.privateKey) {
      throw new Error('KeyPair does not have a private key')
    }

    const bip32 = BIP32Factory(ecc)
    const root = bip32.fromPrivateKey(keyPair.privateKey, Buffer.alloc(32), this.network)

    const child = root.derivePath(`m/0'/0/${index}`)
    const wif = child.toWIF()
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: this.network
    })
    if (!address) {
      throw new Error('P2WPKH does not have a address')
    }

    return { wif, address }
  }

  public createTransaction(walletAddressesData: BitcoinWalletAddressData[], utxosData: BitcoinUtxoData[], feeRate: number, address: string, addressRest: string, amount: bigint): bitcoin.Transaction {
    console.log(`debug >> BitcoinUtilsService, createTransaction: start to create transaction`)

    if (amount <= BITCOIN_DUST_AMOUNT_SATOSHI) {
      throw new BitcoinCoreError(-26, `Output amount ${amount.toString()} is less or equal limit ${BITCOIN_DUST_AMOUNT_SATOSHI} and could not be withdraw due to network rules.`)
    }

    const amountTotal = totalAmountUtxos(utxosData)
    if (amountTotal < amount) {
      throw new BitcoinCoreError(-26, `Input UTXO's total amount is less than required amount ${amount.toString()}.`)
    }

    console.log(`debug >> BitcoinUtilsService, createTransaction: total amount ${amountTotal.toString()}`)

    const outputs: BitcoinWalletAmount[] = []
    if (amountTotal - amount > BITCOIN_DUST_AMOUNT_SATOSHI) {
      console.log(`debug >> BitcoinUtilsService, createTransaction: start to create transactions with 2 outputs`)

      const outputsToEstimate: BitcoinWalletAmount[] = [
        {
          address, amount
        },
        {
          address: addressRest, amount: amountTotal - amount
        }
      ]

      const estimateFeeTx = this.doCreateTransaction(walletAddressesData, utxosData, outputsToEstimate, feeRate, true)
      const fee = this.calcFee(estimateFeeTx, feeRate)

      console.log(`debug >> BitcoinUtilsService, createTransaction: feeRate ${feeRate}`)
      console.log(`debug >> BitcoinUtilsService, createTransaction: fee ${fee.toString()}`)

      if (amount - fee <= BITCOIN_DUST_AMOUNT_SATOSHI) {
        throw new BitcoinCoreError(-26, `Output amount ${amount.toString()} after extracting network fee ${fee.toString()} is less or equal limit ${BITCOIN_DUST_AMOUNT_SATOSHI} and could not be withdraw due to network rules`)
      }

      outputs.push(
        {
          address, amount: amount - fee
        },
        {
          address: addressRest, amount: amountTotal - amount
        }
      )
    } else {
      console.log(`debug >> BitcoinUtilsService, createTransaction: start to create transactions with 1 output`)

      const outputsToEstimate: BitcoinWalletAmount[] = [
        {
          address, amount: amountTotal
        }
      ]

      const estimateFeeTx = this.doCreateTransaction(walletAddressesData, utxosData, outputsToEstimate, feeRate, true)
      const fee = this.calcFee(estimateFeeTx, feeRate)

      console.log(`debug >> BitcoinUtilsService, createTransaction: feeRate ${feeRate}`)
      console.log(`debug >> BitcoinUtilsService, createTransaction: fee ${fee.toString()}`)

      if (amountTotal - fee <= BITCOIN_DUST_AMOUNT_SATOSHI) {
        throw new BitcoinCoreError(-26, `Output amount ${amountTotal.toString()} after extracting network fee ${fee.toString()} is less or equal limit ${BITCOIN_DUST_AMOUNT_SATOSHI} and could not be withdraw due to network rules`)
      }

      outputs.push(
        {
          address, amount: amountTotal - fee
        }
      )
    }

    return this.doCreateTransaction(walletAddressesData, utxosData, outputs, feeRate, true)
  }

  private doCreateTransaction(walletAddressesData: BitcoinWalletAddressData[], utxosData: BitcoinUtxoData[], outputs: BitcoinWalletAmount[], feeRate: number, disableFeeCheck?: boolean): bitcoin.Transaction {
    console.log(`debug >> BitcoinUtilsService, doCreateTransaction: walletAddressesData`)
    console.log(JSON.stringify(walletAddressesData))
    console.log(`debug >> BitcoinUtilsService, doCreateTransaction: utxosData`)
    console.log(JSON.stringify(utxosData))
    console.log(`debug >> BitcoinUtilsService, doCreateTransaction: outputs`)
    console.log(JSON.stringify(outputs, (key, value) => typeof value === 'bigint' ? value.toString() : value))

    const factory = ECPairFactory(ecc)

    const psbt = new bitcoin.Psbt({ network: this.network })

    const wifs: string[] = []
    utxosData.forEach(utxoData => {
      const data = walletAddressesData.find(item => item.address.toLocaleLowerCase() === utxoData.address.toLocaleLowerCase())
      if (!data) {
        throw new Error('Wallet address data not found')
      }

      const amount = parseToBigNumber(utxoData.amount, BITCOIN_DECIMALS)
      psbt.addInput({
        hash: utxoData.txid,
        index: utxoData.vout,
        witnessUtxo: {
          script: bitcoin.address.toOutputScript(utxoData.address, this.network),
          value: parseBigIntToNumber(amount)
        }
      })
      wifs.push(data.wif)
    })

    outputs.forEach(output => psbt.addOutput({
      address: output.address,
      value: parseBigIntToNumber(output.amount)
    }))

    for (let i = 0; i < psbt.inputCount; ++i) {
      const keyPair = factory.fromWIF(wifs[i], this.network)
      psbt.signInput(i, keyPair)
    }

    psbt.finalizeAllInputs()
    psbt.setMaximumFeeRate(Math.ceil(feeRate))

    return psbt.extractTransaction(disableFeeCheck)
  }

  private calcFee(tx: bitcoin.Transaction, feeRate: number): bigint {
    console.log(`debug >> BitcoinUtilsService createTransaction: tx virtualSize ${tx.virtualSize()}`)
    console.log(`debug >> BitcoinUtilsService createTransaction: fee rate ${feeRate}`)
    console.log(`debug >> BitcoinUtilsService createTransaction: fee rate ceil ${Math.ceil(feeRate)}`)

    return BigInt(Math.ceil(tx.virtualSize())) * BigInt(Math.ceil(feeRate))
  }
}
