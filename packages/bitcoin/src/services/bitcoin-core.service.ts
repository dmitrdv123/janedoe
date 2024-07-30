import * as bitcoin from 'bitcoinjs-lib'
import axios, { AxiosResponse } from 'axios'

import { BitcoinBlock } from '@repo/dao/dist/src/interfaces/bitcoin'
import appConfig from '@repo/common/dist/src/app-config'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'

export interface BitcoinCoreService {
  getLatestBlockHeight(): Promise<number>
  getBlockhash(height: number): Promise<string>
  getBlockByHash(blockhash: string): Promise<BitcoinBlock>
  sendTransaction(tx: bitcoin.Transaction): Promise<void>
  getFeeRate(blockcount: number): Promise<number | undefined>
}

export class BitcoinCoreServiceImpl implements BitcoinCoreService {
  public constructor() { }

  public async getLatestBlockHeight(): Promise<number> {
    const response = await this.sendRequest({
      'jsonrpc': '2.0',
      'id': 'getblock.io',
      'method': 'getblockcount',
      'params': []
    })
    return response.data.result
  }

  public async getBlockhash(height: number): Promise<string> {
    const response = await this.sendRequest({
      'jsonrpc': '2.0',
      'id': 'curltest',
      'method': 'getblockhash',
      'params': [height]
    })
    return response.data.result
  }

  public async getBlockByHash(blockhash: string): Promise<BitcoinBlock> {
    const response = await this.sendRequest({
      'jsonrpc': '2.0',
      'id': 'curltest',
      'method': 'getblock',
      'params': [blockhash, 2]  // 2 for detailed transactions
    })
    return response.data.result
  }

  public async sendTransaction(tx: bitcoin.Transaction): Promise<void> {
    await this.sendRequest({
      'jsonrpc': '2.0',
      'id': 'curltest',
      'method': 'sendrawtransaction',
      'params': [tx.toHex(), 0]
    })
  }

  public async getFeeRate(blockcount: number): Promise<number | undefined> {
    const response = await axios.get(appConfig.BITCOIN_FEE_RPC)
    const feeRate = response.data[blockcount.toString()]
    return feeRate ?? undefined
  }

  private async sendRequest<T>(data: T): Promise<AxiosResponse<any, any>> {
    try {
      return await axios.post(appConfig.BITCOIN_RPC, data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        const bitcoinCoreError = err.response.data.error
        if (bitcoinCoreError.code && bitcoinCoreError.message) {
          throw new BitcoinCoreError(bitcoinCoreError.code, bitcoinCoreError.message)
        }
      }

      throw err
    }
  }
}
