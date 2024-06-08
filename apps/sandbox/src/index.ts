import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import * as ecc from 'tiny-secp256k1'
import * as bitcoin from 'bitcoinjs-lib'

import { BIP32Factory } from 'bip32'
import ECPairFactory from 'ecpair'

function generateBitcoinWallets() {
  console.log(`generateBitcoinWallets`)

  const network = bitcoin.networks.bitcoin

  const factory = ECPairFactory(ecc)
  const keyPair = factory.makeRandom()
  const rootWif = keyPair.toWIF()
  if (!keyPair.privateKey) {
    throw new Error('KeyPair does not have a private key.');
  }

  console.log(`root wif ${rootWif}`)

  const bip32 = BIP32Factory(ecc)
  const root = bip32.fromPrivateKey(keyPair.privateKey, Buffer.alloc(32), network)
  for (let i = 0; i <= 10; i++) {
    const child = root.derivePath(`m/0'/0/${i}`)
    const childWif = child.toWIF()
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: network
    })

    console.log(`child wif ${childWif}`)
    console.log(`child address ${address}`)
  }
}

function generateBitcoinWallet() {
  console.log(`generateBitcoinWallet`)

  const factory = ECPairFactory(ecc)
  const keyPair = factory.makeRandom()
  const wif = keyPair.toWIF()

  const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey })

  console.log(`wif ${wif}`)
  console.log(`address ${address}`)
}

async function main() {
  console.log(`hello world!`)

  generateBitcoinWallet()
  generateBitcoinWallets()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
