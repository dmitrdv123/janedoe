import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinBlock, BitcoinTransaction, BitcoinUtxo, BitcoinWalletAddress, BitcoinWalletTransaction } from '@repo/dao/dist/src/interfaces/bitcoin'
import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { CryptoService } from '@repo/common/dist/src/services/crypto-service'

import { BitcoinCoreService } from './bitcoin-core.service'

export interface BitcoinBlockService {
  getBlock(blockhash: string): Promise<BitcoinBlock>
  getBlockhash(height: number): Promise<string>
  getLatestBlockHeight(): Promise<number>
  getLatestProcessedBlockHeight(): Promise<number | undefined>
  updateLatestProcessedBlockHeight(height: number): Promise<void>
  listWalletTransactions(fromHeight: number, toHeight: number): Promise<BitcoinWalletTransaction[]>
  refreshFeeRate(): Promise<boolean>
  processBlock(block: BitcoinBlock): Promise<void>
}

export class BitcoinBlockServiceImpl implements BitcoinBlockService {
  private isInit = false

  public constructor(
    private bitcoinCoreService: BitcoinCoreService,
    private cacheService: CacheService,
    private cryptoService: CryptoService,
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

  public async listWalletTransactions(fromHeight: number, toHeight: number): Promise<BitcoinWalletTransaction[]> {
    return await this.bitcoinDao.listWalletTransactions(fromHeight, toHeight)
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
    console.log(`debug >> processBlock: start to process block ${JSON.stringify(block)}`)

    if (!this.isInit) {
      const [allUtxos, allWalletAddresses] = await Promise.all([
        this.bitcoinDao.listAllUtxos(),
        this.bitcoinDao.listAllWalletAddresses()
      ])

      console.log(`debug >> processBlock: allUtxos ${JSON.stringify(allUtxos)}`)

      allUtxos.forEach(item => {
        const key = `utxo#${item.data.txid}#${item.data.vout}`
        this.cacheService.set(key, item)
      })

      allWalletAddresses.forEach(item => {
        const key = `wallet_address#${item.data.address}`
        this.cacheService.set(key, item)
      })

      this.isInit = true
    }

    await Promise.all(
      block.tx.map(tx => this.processTransaction(tx, block.hash, block.height, block.time))
    )
  }

  private async processTransaction(tx: BitcoinTransaction, blockHash: string, blockHeight: number, blockTime: number): Promise<void> {
    console.log(`debug >> processTransaction: start to process transaction ${JSON.stringify(tx)}`)

    const walletTransactions: BitcoinWalletTransaction[] = []
    const utxosToCreate: BitcoinUtxo[] = []

    const utxosToDelete = tx.vin.reduce((acc, txInput) => {
      if (txInput.txid && txInput.vout !== undefined) {
        const utxo = this.cacheService.get<BitcoinUtxo>(`utxo#${txInput.txid}#${txInput.vout}`)
        if (utxo) {
          acc.push(utxo)
        }
      }

      return acc
    }, [] as BitcoinUtxo[])

    const utxosToDeleteSummary = utxosToDelete.reduce((acc, utxo) => {
      if (!acc[utxo.walletName]) {
        acc[utxo.walletName] = utxo.data.amount
      } else {
        acc[utxo.walletName] += utxo.data.amount
      }

      return acc
    }, {} as { [key: string]: number })

    console.log(`debug >> processTransaction: utxoSummary ${JSON.stringify(utxosToDeleteSummary)}`)
    console.log(`debug >> processTransaction: utxoToDelete ${JSON.stringify(utxosToDelete)}`)

    tx.vout.forEach(txOutput => {
      console.log(`debug >> processTransaction: start to process vout ${JSON.stringify(txOutput)}`)

      if (txOutput.scriptPubKey.address) {
        const outputAddress = txOutput.scriptPubKey.address
        const walletAddress = this.cacheService.get<BitcoinWalletAddress>(`wallet_address#${txOutput.scriptPubKey.address}`)
        console.log(`debug >> processTransaction: walletAddress ${JSON.stringify(walletAddress)}`)

        if (walletAddress) {
          walletTransactions.push({
            walletName: walletAddress.walletName,
            label: walletAddress.label,
            data: {
              txid: tx.txid,
              vout: txOutput.n,
              blockhash: blockHash,
              blockheight: blockHeight,
              time: blockTime,
              hex: txOutput.scriptPubKey.hex,
              address: outputAddress,
              amount: txOutput.value,
              direction: 'incoming'
            }
          })

          utxosToCreate.push({
            walletName: walletAddress.walletName,
            label: walletAddress.label,
            data: {
              txid: tx.txid,
              vout: txOutput.n,
              hex: txOutput.scriptPubKey.hex,
              amount: txOutput.value,
              address: outputAddress
            }
          })
        }

        Object.keys(utxosToDeleteSummary).forEach(
          key => walletTransactions.push({
            walletName: key,
            label: `${key}${this.cryptoService.generateRandom()}`,
            data: {
              txid: tx.txid,
              vout: txOutput.n,
              blockhash: blockHash,
              blockheight: blockHeight,
              time: blockTime,
              hex: txOutput.scriptPubKey.hex,
              address: outputAddress,
              amount: utxosToDeleteSummary[key],
              direction: 'outgoing'
            }
          })
        )
      }
    })

    if (walletTransactions.length > 0) {
      console.log(`debug >> processTransaction: start to save wallet transactions ${JSON.stringify(walletTransactions)}`)
      await this.bitcoinDao.saveWalletTransactions(walletTransactions)
    }

    if (utxosToCreate.length > 0) {
      console.log(`debug >> processTransaction: start to save utxo ${JSON.stringify(utxosToCreate)}`)
      await this.bitcoinDao.saveUtxos(utxosToCreate, true)
    }

    if (utxosToDelete.length > 0) {
      console.log(`debug >> processTransaction: start to delete utxo ${JSON.stringify(utxosToDelete)}`)
      await this.bitcoinDao.deleteUtxos(utxosToDelete.map(item => ({
        txid: item.data.txid,
        vout: item.data.vout
      })))
    }
  }
}
