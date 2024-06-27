import { BitcoinTransactionOutput, BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress } from '../interfaces/bitcoin'

export interface BitcoinDao {
  loadLatestProcessedBlockHeight(): Promise<number | undefined>
  saveLatestProcessedBlockHeight(height: number): Promise<void>

  saveFeeRate(feeRate: number): Promise<void>
  loadFeeRate(): Promise<number | undefined>

  saveWallet(wallet: BitcoinWallet): Promise<void>
  loadWallet(walletName: string): Promise<BitcoinWallet | undefined>
  saveWalletAddress(wallet: BitcoinWalletAddress): Promise<void>
  loadWalletAddress(walletName: string, label: string): Promise<BitcoinWalletAddress | undefined>
  loadWalletAddressByAddress(address: string): Promise<BitcoinWalletAddress | undefined>
  listWalletAddresses(walletName: string): Promise<BitcoinWalletAddress[]>
  updateWalletAddressCounter(walletName: string): Promise<number>

  saveUtxos(utxos: BitcoinUtxo[], active: boolean): Promise<void>
  loadUtxos(keys: BitcoinUtxoDataKey[]): Promise<BitcoinUtxo[]>
  deleteUtxos(keys: BitcoinUtxoDataKey[]): Promise<void>
  listWalletUtxos(walletName: string, active: boolean): Promise<BitcoinUtxo[]>
  listWalletAddressUtxos(walletName: string, label: string, active: boolean): Promise<BitcoinUtxo[]>

  loadWalletBalance(walletName: string): Promise<number>
  loadWalletAddressBalance(walletName: string, label: string): Promise<number>

  loadTransactionOutput(txid: string, vout: number): Promise<BitcoinTransactionOutput | undefined>
  saveTransactionOutputs(transactionOutputs: BitcoinTransactionOutput[]): Promise<void>
  listTransactionOutputs(fromBlockheight: number, toBlockheight: number): Promise<BitcoinTransactionOutput[]>
}
