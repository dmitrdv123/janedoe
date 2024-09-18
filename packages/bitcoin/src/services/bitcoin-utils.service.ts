import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'

import { BIP32Factory } from 'bip32'
import ECPairFactory from 'ecpair'

import { BitcoinUtxoData, BitcoinWalletAddressData, BitcoinWalletData } from '@repo/dao/dist/src/interfaces/bitcoin'
import { parseBigIntToNumber, parseToBigNumber } from '../utils/bitcoin-utils'
import { BITCOIN_DECIMALS, BITCOIN_DUST_AMOUNT } from '../constants'

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

  public createTransaction(walletAddressData: BitcoinWalletAddressData[], utxosData: BitcoinUtxoData[], feeRate: number, address: string, addressRest: string, value: bigint, disableFeeCheck?: boolean): bitcoin.Transaction {
    const factory = ECPairFactory(ecc)

    const psbt = new bitcoin.Psbt({ network: this.network })

    const wifs: string[] = []
    let totalInputAmount = BigInt(0)
    utxosData.forEach(utxoData => {
      const data = walletAddressData.find(item => item.address.toLocaleLowerCase() === utxoData.address.toLocaleLowerCase())
      if (!data) {
        throw new Error('Wallet address data not found')
      }

      if (utxoData.amount <= BITCOIN_DUST_AMOUNT) {
        return
      }

      wifs.push(data.wif)

      const amount = parseToBigNumber(utxoData.amount, BITCOIN_DECIMALS)
      totalInputAmount += amount
      psbt.addInput({
        hash: utxoData.txid,
        index: utxoData.vout,
        witnessUtxo: {
          script: bitcoin.address.toOutputScript(utxoData.address, this.network),
          value: parseBigIntToNumber(amount)
        }
      })
    })

    psbt.addOutput({ address, value: parseBigIntToNumber(value) })
    const valueRest = totalInputAmount - value
    if (valueRest > BITCOIN_DUST_AMOUNT) {
      psbt.addOutput({ address: addressRest, value: parseBigIntToNumber(valueRest) })
    }

    for (let i = 0; i < psbt.inputCount; ++i) {
      const keyPair = factory.fromWIF(wifs[i], this.network)
      psbt.signInput(i, keyPair)
    }

    psbt.finalizeAllInputs()
    psbt.setMaximumFeeRate(Math.ceil(feeRate))

    return psbt.extractTransaction(disableFeeCheck)
  }
}
