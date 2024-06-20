import axios, { AxiosError } from 'axios'

import appConfig from '@repo/common/dist/src/app-config'
import { BitcoinCoreError } from '@repo/bitcoin/dist/src/errors/bitcoin-core-error'

import { BitcoinCoreResult, LoadBitcoinWalletResult, SendBitcoinToResult } from '../interfaces/index'

export interface BitcoinWrapperService {
  loadBitcoinWallet(walletName: string): Promise<void>
  unloadBitcoinWallet(walletName: string): Promise<void>
  sendBitcoinTo(walletName: string, address: string, amount: number): Promise<void>
}

export class BitcoinWrapperServiceImpl implements BitcoinWrapperService {
  public constructor() { }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "loadwallet", "params": ["descriptors"]}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443
  // {"result":{"name":"descriptors"},"error":null,"id":"curltest"}
  // {"result":null,"error":{"code":-35,"message":"Wallet \"descriptors\" is already loaded."},"id":"curltest"}
  public async loadBitcoinWallet(walletName: string): Promise<void> {
    try {
      await this.queryBitcoin<LoadBitcoinWalletResult>('', 'loadwallet', { filename: walletName })
    } catch (err) {
      if (err instanceof BitcoinCoreError) {
        const bitcoinCoreError = err as BitcoinCoreError
        if (bitcoinCoreError.code === -35) {
          return
        }
      }

      throw err
    }
  }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "unloadwallet", "params": ["descriptors"]}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443
  // {"result":{},"error":null,"id":"curltest"}
  // {"result":null,"error":{"code":-18,"message":"Requested wallet does not exist or is not loaded"},"id":"curltest"}
  public async unloadBitcoinWallet(walletName: string): Promise<void> {
    try {
      await this.queryBitcoin<void>('', 'unloadwallet', { wallet_name: walletName })
    } catch (err) {
      if (err instanceof BitcoinCoreError) {
        const bitcoinCoreError = err as BitcoinCoreError
        if (bitcoinCoreError.code === -18) {
          return
        }
      }

      throw err
    }
  }

  public async sendBitcoinTo(walletName: string, address: string, amount: number): Promise<void> {
    await this.queryBitcoin<SendBitcoinToResult>(`wallet/${walletName}`, 'sendtoaddress', { address, amount, subtractfeefromamount: true })
  }

  private async queryBitcoin<T>(url: string, method: string, params: unknown): Promise<T> {
    try {
      const response = await axios.post<BitcoinCoreResult<T>>(
        `${appConfig.BITCOIN_RPC}/${url}`,
        {
          method,
          params,
          jsonrpc: "1.0",
          id: "curltext"
        },
        {
          headers: {
            'content-type': 'text/plain'
          }
        }
      )

      if (response.data.result === null || response.data.result === undefined) {
        throw new Error('Unexpected bitcoin core response. Result is not set.')
      }

      return response.data.result
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data as BitcoinCoreResult<unknown>
        if (data.error) {
          throw new BitcoinCoreError(data.error.code, data.error.message)
        }
      }

      throw err
    }
  }
}
