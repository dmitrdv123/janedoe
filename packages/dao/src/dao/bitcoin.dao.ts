import { BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress, BitcoinWalletAddressKey, BitcoinWalletTransaction } from '../interfaces/bitcoin'

export interface BitcoinDao {
  loadLatestProcessedBlockHeight(): Promise<number | undefined>
  saveLatestProcessedBlockHeight(height: number): Promise<void>

  saveFeeRate(feeRate: number): Promise<void>
  loadFeeRate(): Promise<number | undefined>

  saveWallet(wallet: BitcoinWallet): Promise<void>
  loadWallet(walletName: string): Promise<BitcoinWallet | undefined>
  saveWalletAddress(wallet: BitcoinWalletAddress): Promise<void>
  loadWalletAddress(walletName: string, label: string): Promise<BitcoinWalletAddress | undefined>
  loadWalletAddresses(walletAddressKeys: BitcoinWalletAddressKey[]): Promise<BitcoinWalletAddress[]>
  listWalletAddresses(walletName: string): Promise<BitcoinWalletAddress[]>
  listAllWalletAddresses(): Promise<BitcoinWalletAddress[]>
  updateWalletAddressCounter(walletName: string): Promise<number>

  saveUtxos(utxos: BitcoinUtxo[], active: boolean): Promise<void>
  loadUtxo(key: BitcoinUtxoDataKey, active: boolean): Promise<BitcoinUtxo | undefined>
  deleteUtxos(keys: BitcoinUtxoDataKey[]): Promise<void>
  listAllUtxos(): Promise<BitcoinUtxo[]>
  listWalletUtxos(walletName: string, active: boolean): Promise<BitcoinUtxo[]>
  listWalletAddressUtxos(walletName: string, label: string, active: boolean): Promise<BitcoinUtxo[]>

  loadWalletBalance(walletName: string): Promise<number>
  loadWalletAddressBalance(walletName: string, label: string): Promise<number>

  saveWalletTransactions(walletTransactions: BitcoinWalletTransaction[]): Promise<void>
  listWalletTransactions(fromBlockheight: number, toBlockheight: number): Promise<BitcoinWalletTransaction[]>
}
