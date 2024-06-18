import * as bitcoin from 'bitcoinjs-lib'
import axios from 'axios'

import { BitcoinBlock, BitcoinTransaction } from '@repo/dao/dist/src/interfaces/bitcoin'
import appConfig from '@repo/common/dist/src/app-config'

export interface BitcoinCoreService {
  getLatestBlockheight(): Promise<number>
  getBlockhash(height: number): Promise<string>
  getBlockByHash(blockhash: string): Promise<BitcoinBlock>
  getTransaction(txid: string): Promise<BitcoinTransaction>
  sendTransaction(tx: bitcoin.Transaction): Promise<void>
  getFeeRate(blockcount: number): Promise<number>
}

export class BitcoinCoreServiceImpl implements BitcoinCoreService {
  public constructor() { }

  public async getLatestBlockheight(): Promise<number> {
    bitcoin.Block
    const data = {
      "jsonrpc": "1.0",
      "id": "getblock.io",
      "method": "getblockcount",
      "params": []
    }
    const response = await axios.post(appConfig.BITCOIN_RPC, data)
    return response.data.result
  }

  public async getBlockhash(height: number): Promise<string> {
    const data = {
      "jsonrpc": "1.0",
      "id": "curltest",
      "method": "getblockhash",
      "params": [height]
    }
    const response = await axios.post(appConfig.BITCOIN_RPC, data)
    return response.data.result
  }

  public async getBlockByHash(blockhash: string): Promise<BitcoinBlock> {
    const data = {
      "jsonrpc": "1.0",
      "id": "curltest",
      "method": "getblock",
      "params": [blockhash, 2]  // 2 for detailed transactions
    }
    const response = await axios.post(appConfig.BITCOIN_RPC, data)
    return response.data.result
  }

  public async getTransaction(txid: string): Promise<BitcoinTransaction> {
    const data = {
      "jsonrpc": "1.0",
      "id": "curltest",
      "method": "getrawtransaction",
      "params": [txid, 2]
    }
    const response = await axios.post(appConfig.BITCOIN_RPC, data)
    return response.data.result
  }

  public async sendTransaction(tx: bitcoin.Transaction): Promise<void> {
    const data = {
      "jsonrpc": "1.0",
      "id": "curltest",
      "method": "sendrawtransaction",
      "params": [tx.toHex(), 0]
    }
    await axios.post(appConfig.BITCOIN_RPC, data)
  }

  public async getFeeRate(blockcount: number): Promise<number> {
    const response = await axios.get(appConfig.BITCOIN_FEE_RPC)
    return response.data[blockcount.toString()]
  }
}
