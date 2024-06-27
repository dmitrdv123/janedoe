import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinBlock, BitcoinTransactionOutput, BitcoinTransactionOutputData, BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWalletAddress } from '@repo/dao/dist/src/interfaces/bitcoin'
import { CacheService } from '@repo/common/dist/src/services/cache-service'

import { BitcoinCoreService } from './bitcoin-core.service'

export interface BitcoinBlockService {
  getBlock(blockhash: string): Promise<BitcoinBlock>
  getBlockhash(height: number): Promise<string>
  getLatestBlockHeight(): Promise<number>
  getLatestProcessedBlockHeight(): Promise<number | undefined>
  updateLatestProcessedBlockHeight(height: number): Promise<void>
  listBlockTransactionOutputs(fromHeight: number, toHeight: number): Promise<BitcoinTransactionOutput[]>
  refreshFeeRate(): Promise<boolean>
  processBlock(block: BitcoinBlock): Promise<void>
}

export class BitcoinBlockServiceImpl implements BitcoinBlockService {
  private isInit = false

  public constructor(
    private bitcoinCoreService: BitcoinCoreService,
    private cacheService: CacheService,
    private bitcoinDao: BitcoinDao
  ) { }

  public async getBlock(blockhash: string): Promise<BitcoinBlock> {
    return await this.bitcoinCoreService.getBlockByHash(blockhash)
  }

  public async getBlockhash(height: number): Promise<string> {
    return await this.bitcoinCoreService.getBlockhash(height)
  }

  public async getLatestBlockHeight(): Promise<number> {
    return await this.bitcoinCoreService.getLatestBlockHeight()
  }

  public async getLatestProcessedBlockHeight(): Promise<number | undefined> {
    return await this.bitcoinDao.loadLatestProcessedBlockHeight()
  }

  public async updateLatestProcessedBlockHeight(height: number): Promise<void> {
    await this.bitcoinDao.saveLatestProcessedBlockHeight(height)
  }

  public async listBlockTransactionOutputs(fromHeight: number, toHeight: number): Promise<BitcoinTransactionOutput[]> {
    return await this.bitcoinDao.listTransactionOutputs(fromHeight, toHeight)
  }

  public async refreshFeeRate(): Promise<boolean> {
    const feeRate = await this.bitcoinCoreService.getFeeRate(3)
    if (!feeRate) {
      return false
    }

    await this.bitcoinDao.saveFeeRate(feeRate)
    return true
  }

  public async processBlock(block: BitcoinBlock): Promise<void> {
    if (!this.isInit) {
      const [allUtxos, allWalletAddresses] = await Promise.all([
        this.bitcoinDao.listAllUtxos(),
        this.bitcoinDao.listAllWalletAddresses()
      ])

      allUtxos.forEach(item => {
        const key = `utxo#${item.data.txid}#${item.data.vout}`
        this.cacheService.set(key, key)
      })

      allWalletAddresses.forEach(item => {
        const key = `wallet_address#${item.data.address}`
        this.cacheService.set(key, item)
      })

      this.isInit = true
    }

    const utxoDataKeysForDelete = this.processVins(block)
    const transactionOutputs = this.processVouts(block)

    const utxosForSave: BitcoinUtxo[] = transactionOutputs.map(item => ({
      walletName: item.walletName,
      label: item.label,
      data: {
        txid: item.data.txid,
        vout: item.data.vout,
        hex: item.data.hex,
        amount: item.data.amount,
        address: item.data.address
      }
    }))

    const filteredUtxoDataKeysForDelete = this.filterUtxoKeys(utxosForSave, utxoDataKeysForDelete)
    const filteredUtxosForSave = this.filterUtxos(utxosForSave, utxoDataKeysForDelete)

    if (transactionOutputs.length > 0) {
      await this.bitcoinDao.saveTransactionOutputs(transactionOutputs)
    }
    if (filteredUtxoDataKeysForDelete.length > 0) {
      await this.bitcoinDao.deleteUtxos(filteredUtxoDataKeysForDelete)
    }
    if (filteredUtxosForSave.length > 0) {
      await this.bitcoinDao.saveUtxos(filteredUtxosForSave, true)
    }
  }

  private filterUtxos(utxos: BitcoinUtxo[], utxoDataKeys: BitcoinUtxoDataKey[]) {
    const keys = new Set<string>(utxoDataKeys.map(key => `${key.txid}#${key.vout}`))
    return utxos.filter(utxo => !keys.has(`${utxo.data.txid}#${utxo.data.vout}`))
  }

  private filterUtxoKeys(utxos: BitcoinUtxo[], utxoDataKeys: BitcoinUtxoDataKey[]) {
    const keys = new Set<string>(utxos.map(key => `${key.data.txid}#${key.data.vout}`))
    return utxoDataKeys.filter(utxo => !keys.has(`${utxo.txid}#${utxo.vout}`))
  }

  private processVins(block: BitcoinBlock): BitcoinUtxoDataKey[] {
    return block.tx
      .map(
        transaction => transaction.vin.reduce((acc, txInput) => {
          if (txInput.txid !== undefined && txInput.vout !== undefined && this.cacheService.has(`utxo#${txInput.txid}#${txInput.vout}`)) {
            acc.push({
              txid: txInput.txid,
              vout: txInput.vout
            })
          }

          return acc
        }, [] as BitcoinUtxoDataKey[])
      )
      .flat()
  }

  private processVouts(block: BitcoinBlock): BitcoinTransactionOutput[] {
    return block.tx
      .map(
        transaction => transaction.vout.reduce((acc, txOutput) => {
          if (txOutput.scriptPubKey.address && this.cacheService.has(`wallet_address#${txOutput.scriptPubKey.address}`)) {
            const walletAddress = this.cacheService.get<BitcoinWalletAddress>(`wallet_address#${txOutput.scriptPubKey.address}`)

            if (walletAddress) {
              acc.push({
                walletName: walletAddress.walletName,
                label: walletAddress.label,
                data: {
                  txid: transaction.txid,
                  vout: txOutput.n,
                  blockhash: block.hash,
                  blockheight: block.height,
                  time: block.time,
                  hex: txOutput.scriptPubKey.hex,
                  address: txOutput.scriptPubKey.address,
                  amount: txOutput.value
                }
              })
            }
          }

          return acc
        }, [] as BitcoinTransactionOutput[])
      )
      .flat()
  }
}
