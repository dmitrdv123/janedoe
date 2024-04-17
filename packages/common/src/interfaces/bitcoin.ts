export interface CreateBitcoinWalletResult {
  name: string
}

export interface LoadBitcoinWalletResult {
  name: string
}

export interface WithdrawBitcoinWalletResult {
  txid: string
  complete: boolean
}

export interface SendBitcoinToResult {
  txid: string
  fee_reason: string
}

export interface ListBitcoinWalletTransactionsResult {
  txid: string
  address: string
  label: string | null | undefined
  category: string
  amount: number
  time: number
  confirmations: number
  trusted: boolean
  blockhash: string
  blockindex: number
}

export interface ListBitcoinWalletTransactionsSinceBlockResult {
  transactions: ListBitcoinWalletTransactionsResult[]
  removed: ListBitcoinWalletTransactionsResult[]
  lastblock: string
}

export interface BitcoinDescriptorInfoResult {
  descriptor: string
  checksum: string
  isrange: boolean
  issolvable: boolean
  hasprivatekeys: boolean
}

export interface BitcoinBlockResult {
  hash: string
  confirmations: number
  size: number
  strippedsize: number
  weight: number
  height: number
  version: number
  versionHex: string
  merkleroot: string
  time: number
  mediantime: number
  nonce: number
  bits: string
  difficulty: number
  chainwork: string
  nTx: number
  previousblockhash: string | undefined
  nextblockhash: string | undefined
}

export interface BitcoinCoreResult<T> {
  id: string,
  result: T | null | undefined
  error: {
    code: number,
    message: string,
  } | null | undefined
}
