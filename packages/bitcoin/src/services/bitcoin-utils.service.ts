import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'

import { BIP32Factory } from 'bip32'
import ECPairFactory from 'ecpair'

import { BitcoinUtxoData, BitcoinWalletAddressData, BitcoinWalletAmount, BitcoinWalletData } from '@repo/dao/dist/src/interfaces/bitcoin'
import { parseBigIntToNumber, parseToBigNumber } from '../utils/bitcoin-utils'
import { BITCOIN_DECIMALS, BITCOIN_DUST_AMOUNT, BITCOIN_DUST_AMOUNT_SATOSHI } from '../constants'
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
    const utxosDataFiltered = utxosData.filter(utxoData => utxoData.amount > BITCOIN_DUST_AMOUNT)
    if (utxosDataFiltered.length === 0) {
      throw new BitcoinCoreError(-26, `All input UTXOs is less or equal limit ${BITCOIN_DUST_AMOUNT} and could not be withdraw due to network rules`)
    }

    const amountTotal = utxosDataFiltered.reduce(
      (acc, utxoData) => acc + parseToBigNumber(utxoData.amount, BITCOIN_DECIMALS), BigInt(0)
    )

    if (amountTotal - amount > BITCOIN_DUST_AMOUNT_SATOSHI) {
      const outputsToEstimate: BitcoinWalletAmount[] = [
        {
          address, amount
        },
        {
          address: addressRest, amount: amountTotal - amount
        }
      ]

      const estimateFeeTx2Outputs = this.doCreateTransaction(walletAddressesData, utxosDataFiltered, outputsToEstimate, feeRate, true)
      const fee = BigInt(Math.ceil(estimateFeeTx2Outputs.virtualSize() * feeRate))
      if (amountTotal - amount - fee > BITCOIN_DUST_AMOUNT_SATOSHI) {
        const outputs: BitcoinWalletAmount[] = [
          {
            address, amount: amount - fee
          },
          {
            address: addressRest, amount: amountTotal - amount
          }
        ]
        return this.doCreateTransaction(walletAddressesData, utxosDataFiltered, outputs, feeRate, false)
      }
    }

    if (amount > BITCOIN_DUST_AMOUNT_SATOSHI) {
      const outputsToEstimate: BitcoinWalletAmount[] = [
        {
          address, amount
        }
      ]

      const estimateFeeTx1Outputs = this.doCreateTransaction(walletAddressesData, utxosDataFiltered, outputsToEstimate, feeRate, true)
      const fee = BigInt(Math.ceil(estimateFeeTx1Outputs.virtualSize() * feeRate))
      if (amount - fee > BITCOIN_DUST_AMOUNT_SATOSHI) {
        const outputs: BitcoinWalletAmount[] = [
          {
            address, amount: amount - fee
          }
        ]
        return this.doCreateTransaction(walletAddressesData, utxosDataFiltered, outputs, feeRate, false)
      }
    }

    throw new BitcoinCoreError(-26, `Output amount after extracting network fee is less or equal limit ${BITCOIN_DUST_AMOUNT} and could not be withdraw due to network rules`)
  }

  private doCreateTransaction(walletAddressesData: BitcoinWalletAddressData[], utxosData: BitcoinUtxoData[], outputs: BitcoinWalletAmount[], feeRate: number, disableFeeCheck?: boolean): bitcoin.Transaction {
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
}
