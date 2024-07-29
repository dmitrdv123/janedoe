export interface BitcoinTransactionOutputData {
  txid: string
  vout: number
  blockhash: string
  blockheight: number
  time: number
  hex: string
  address: string
  amount: number
}

export interface BitcoinTransactionOutput {
  walletName: string
  label: string
  data: BitcoinTransactionOutputData
}

export interface BitcoinUtxoDataKey {
  txid: string
  vout: number
}

export interface BitcoinUtxoData {
  txid: string
  vout: number
  hex: string
  amount: number
  address: string
}

export interface BitcoinUtxo {
  walletName: string
  label: string
  data: BitcoinUtxoData
}

export interface BitcoinWalletAddressData {
  wif: string
  address: string
}

export interface BitcoinWalletAddress {
  walletName: string
  label: string
  data: BitcoinWalletAddressData
}

export interface BitcoinWalletAddressKey {
  walletName: string
  label: string
}

export interface BitcoinWalletData {
  wif: string
  address: string
}

export interface BitcoinWallet {
  walletName: string
  data: BitcoinWalletData
}

export interface BitcoinVin {
  coinbase?: string
  txid?: string
  vout?: number
  scriptSig?: {
    asm: string
    hex: string
  }
  txinwitness?: string[]
  sequence: number
}

export interface BitcoinScriptPubKey {
  asm: string
  desc: string
  hex: string
  address?: string
  type: string
}

export interface BitcoinVout {
  value: number
  n: number
  scriptPubKey: BitcoinScriptPubKey
}

export interface BitcoinTransaction {
  txid: string
  hash: string
  size: number
  vsize: number
  weight: number
  version: number
  locktime: number
  vin: BitcoinVin[]
  vout: BitcoinVout[]
}

export interface BitcoinBlock {
  hash: string
  confirmations: number
  size: number
  strippedsize: number
  weight: number
  height: number
  version: number
  versionHex: string
  merkleroot: string
  tx: BitcoinTransaction[]
  time: number
  mediantime: number
  nonce: number
  bits: string
  difficulty: number
  chainwork: string
  nTx: number
  previousblockhash?: string | undefined
  nextblockhash?: string | undefined
}
