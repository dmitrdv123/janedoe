import { BitcoinBlock, BitcoinTransactionOutput, BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress } from '../interfaces/bitcoin'

export interface BitcoinDao {
  saveProcessedBlock(block: BitcoinBlock): Promise<void>
  loadProcessedBlock(blockhash: string): Promise<BitcoinBlock | undefined>
  loadLatestProcessedBlock(): Promise<BitcoinBlock | undefined>
  saveLatestProcessedBlock(block: BitcoinBlock): Promise<void>

  saveFeeRate(feeRate: number): Promise<void>
  loadFeeRate(): Promise<number | undefined>

  saveWallet(wallet: BitcoinWallet): Promise<void>
  loadWallet(walletName: string): Promise<BitcoinWallet | undefined>
  saveWalletAddress(wallet: BitcoinWalletAddress): Promise<void>
  loadWalletAddress(walletName: string, label: string): Promise<BitcoinWalletAddress | undefined>
  loadWalletAddressByAddress(address: string): Promise<BitcoinWalletAddress | undefined>
  listWalletAddressLabels(walletName: string): Promise<string[]>
  updateWalletAddressCounter(walletName: string): Promise<number>

  saveUtxos(utxos: BitcoinUtxo[]): Promise<void>
  deleteUtxos(keys: BitcoinUtxoDataKey[]): Promise<void>
  listUtxos(walletName: string): Promise<BitcoinUtxo[]>

  saveWalletBalance(walletName: string, amount: number): Promise<void>
  loadWalletBalance(walletName: string): Promise<number | undefined>
  saveWalletAddressBalance(rootwalletName: string, walletName: string, amount: number): Promise<void>
  loadWalletAddressBalance(rootwalletName: string, walletName: string): Promise<number | undefined>

  loadTransactionOutput(txid: string, vout: number): Promise<BitcoinTransactionOutput | undefined>
  saveTransactionOutputs(transactionOutputs: BitcoinTransactionOutput[]): Promise<void>
  listTransactionOutputs(fromBlockheight: number, toBlockheight: number): Promise<BitcoinTransactionOutput[]>
}
