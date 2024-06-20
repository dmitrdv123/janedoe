export interface CreateBitcoinWalletResult {
  name: string
}

export interface LoadBitcoinWalletResult {
  name: string
}

export interface UnloadBitcoinWalletResult {
}

export interface BitcoinDescriptorInfo {
  descriptor: string
  checksum: string
  isrange: boolean
  issolvable: boolean
  hasprivatekeys: boolean
}

export interface WithBitcoinWalletResult {
  txid: string
  complete: boolean
}

export interface SendBitcoinToResult {
  txid: string
  fee_reason: string
}

export interface BitcoinCoreResult<T> {
  id: string,
  result: T | null | undefined
  error: {
    code: number,
    message: string,
  } | null | undefined
}

export interface NetworkInfo {
  name: string
  chainId: number
  hexChainId: string
}
