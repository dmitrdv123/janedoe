import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinBlock, BitcoinTransaction, BitcoinTransactionOutput, BitcoinUtxo, BitcoinUtxoDataKey, BitcoinVout } from '@repo/dao/dist/src/interfaces/bitcoin'

import { BitcoinCoreService } from './bitcoin-core.service'
import { convertBigIntToFloat, parseToBigNumber } from '../utils/bitcoin-utils'
import { BITCOIN_DECIMALS } from '../constants'

export interface BitcoinBlockService {
  getBlock(blockhash: string): Promise<BitcoinBlock>
  getBlockhash(height: number): Promise<string>
  getProcessedBlock(blockhash: string): Promise<BitcoinBlock | undefined>
  getLatestProcessedBlock(): Promise<BitcoinBlock | undefined>
  updateLatestProcessedBlock(block: BitcoinBlock): Promise<void>
  listBlockTransactionOutputs(fromHeight: number, toHeight: number): Promise<BitcoinTransactionOutput[]>
  processBlock(block: BitcoinBlock): Promise<void>
}

export class BitcoinBlockServiceImpl implements BitcoinBlockService {
  public constructor(
    private bitcoinCoreService: BitcoinCoreService,
    private bitcoinDao: BitcoinDao
  ) { }

  public async getBlock(blockhash: string): Promise<BitcoinBlock> {
    return await this.bitcoinCoreService.getBlockByHash(blockhash)
  }

  public async getBlockhash(height: number): Promise<string> {
    return await this.bitcoinCoreService.getBlockhash(height)
  }

  public async getProcessedBlock(blockhash: string): Promise<BitcoinBlock | undefined> {
    return await this.bitcoinDao.loadProcessedBlock(blockhash)
  }

  public async getLatestProcessedBlock(): Promise<BitcoinBlock | undefined> {
    return await this.bitcoinDao.loadLatestProcessedBlock()
  }

  public async updateLatestProcessedBlock(block: BitcoinBlock): Promise<void> {
    await this.bitcoinDao.saveLatestProcessedBlock(block)
  }

  public async listBlockTransactionOutputs(fromHeight: number, toHeight: number): Promise<BitcoinTransactionOutput[]> {
    return await this.bitcoinDao.listTransactionOutputs(fromHeight, toHeight)
  }

  public async processBlock(block: BitcoinBlock): Promise<void> {
    const feeRate = await this.bitcoinCoreService.getFeeRate(3)

    const utxoDataKeysForDelete = this.processVins(block)
    const transactionOutputs = await this.processVouts(block)

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

    const walletNames = await this.changedWalletNames(filteredUtxoDataKeysForDelete, filteredUtxosForSave)

    if (transactionOutputs.length > 0) {
      await this.bitcoinDao.saveTransactionOutputs(transactionOutputs)
    }
    if (filteredUtxoDataKeysForDelete.length > 0) {
      await this.bitcoinDao.deleteUtxos(filteredUtxoDataKeysForDelete)
    }
    if (filteredUtxosForSave.length > 0) {
      await this.bitcoinDao.saveUtxos(filteredUtxosForSave)
    }
    if (walletNames.length > 0) {
      await this.updateBalances(walletNames)
    }
    await this.bitcoinDao.saveFeeRate(feeRate)
    await this.bitcoinDao.saveProcessedBlock(block)
  }

  private async updateBalances(walletNames: string[]): Promise<void> {
    await Promise.all(
      walletNames.map(walletName => this.updateBalance(walletName))
    )
  }

  private async updateBalance(walletName: string): Promise<void> {
    const [walletAddresses, utxos] = await Promise.all([
      await this.bitcoinDao.listWalletAddresses(walletName),
      await this.bitcoinDao.listUtxos(walletName)
    ])

    const amountByLabel = walletAddresses.reduce((acc, walletAddress) => {
      acc[walletAddress.label] = BigInt(0)
      return acc
    }, {} as { [key: string]: bigint })

    let totalAmount = BigInt(0)
    const amountByLabelResult = utxos.reduce((acc, utxo) => {
      if (!acc[utxo.label]) {
        acc[utxo.label] = BigInt(0)
      }

      const delta = parseToBigNumber(utxo.data.amount, BITCOIN_DECIMALS)
      totalAmount += delta
      acc[utxo.label] += delta

      return acc
    }, amountByLabel)

    await Promise.all(
      [
        this.bitcoinDao.saveWalletBalance(walletName, convertBigIntToFloat(totalAmount, BITCOIN_DECIMALS)),
        ...Object.entries(amountByLabelResult)
          .map(([label, amount]) =>
            this.bitcoinDao.saveWalletAddressBalance(walletName, label, convertBigIntToFloat(amount, BITCOIN_DECIMALS))
          )
      ]
    )
  }

  private async changedWalletNames(dataKeysForDelete: BitcoinUtxoDataKey[], utxosForSave: BitcoinUtxo[]): Promise<string[]> {
    const transactionOutputs = await Promise.all(
      dataKeysForDelete.map(async key => this.bitcoinDao.loadTransactionOutput(key.txid, key.vout))
    )

    const walletNames = [
      ...transactionOutputs.map(item => item?.walletName).filter(item => !!item) as string[],
      ...utxosForSave.map(utxo => utxo.walletName)
    ]

    return Array.from(new Set(walletNames))
  }

  private filterUtxos(utxos: BitcoinUtxo[], utxoDataKeys: BitcoinUtxoDataKey[]) {
    const keys = new Set<string>(utxoDataKeys.map(key => `${key.txid}#${key.vout}`))
    return utxos.filter(utxo => !keys.has(`${utxo.data.txid}#${utxo.data.vout}`))
  }

  private filterUtxoKeys(utxos: BitcoinUtxo[], utxoDataKeys: BitcoinUtxoDataKey[]) {
    const keys = new Set<string>(utxos.map(key => `${key.data.txid}#${key.data.vout}`))
    return utxoDataKeys.filter(utxo => !keys.has(`${utxo.txid}#${utxo.vout}`))
  }

  private async processVouts(block: BitcoinBlock): Promise<BitcoinTransactionOutput[]> {
    const bitcoinTransactionOutputs = await Promise.all(
      block.tx
        .map(transaction => transaction.vout.map(
          txOutput => this.processVout(block, transaction, txOutput)
        ))
        .flat()
    )

    return bitcoinTransactionOutputs.reduce((acc, item) => {
      if (item) {
        acc.push(item)
      }
      return acc
    }, [] as BitcoinTransactionOutput[])
  }

  private async processVout(block: BitcoinBlock, transaction: BitcoinTransaction, vout: BitcoinVout): Promise<BitcoinTransactionOutput | undefined> {
    if (!vout.scriptPubKey.address) {
      return undefined
    }

    const walletAddress = await this.bitcoinDao.loadWalletAddressByAddress(vout.scriptPubKey.address)
    if (!walletAddress) {
      return undefined
    }

    return {
      walletName: walletAddress.walletName,
      label: walletAddress.label,
      data: {
        txid: transaction.txid,
        vout: vout.n,
        blockhash: block.hash,
        blockheight: block.height,
        time: block.time,
        hex: vout.scriptPubKey.hex,
        address: vout.scriptPubKey.address,
        amount: vout.value
      }
    }
  }

  private processVins(block: BitcoinBlock): BitcoinUtxoDataKey[] {
    return block.tx
      .map(
        transaction => transaction.vin.reduce((acc, txInput) => {
          if (txInput.txid !== undefined && txInput.vout !== undefined) {
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
}
