import axios, { AxiosError } from 'axios'

import appConfig from '../app-config'

import { BitcoinBlockResult, BitcoinCoreResult, BitcoinDescriptorInfoResult, CreateBitcoinWalletResult, ListBitcoinWalletTransactionsSinceBlockResult, LoadBitcoinWalletResult, SendBitcoinToResult, WithdrawBitcoinWalletResult } from '../interfaces/bitcoin'
import { DEFAULT_BITCOIN_CACHING_SECONDS } from '../constants'
import { CacheService } from './cache-service'
import { AddressByLabelResult } from '../interfaces/address-by-label-result'
import { BitcoinCoreError } from '../errors/bitcoin-core-error'

export interface BitcoinWrapperService {
  createBitcoinWallet(walletName: string, disablePrivateKeys: boolean): Promise<void>
  loadBitcoinWallet(walletName: string): Promise<void>
  unloadBitcoinWallet(walletName: string): Promise<void>
  listBitcoinWallets(): Promise<string[]>
  createBitcoinAddress(walletName: string, label: string): Promise<string>
  getBitcoinBalance(walletName: string, minconf: number): Promise<number>
  receivedBitcoinByLabel(walletName: string, label: string, minconf: number, includeImmature: boolean): Promise<number>
  withdrawBitcoin(walletName: string, address: string): Promise<WithdrawBitcoinWalletResult>
  importBitcoinDescriptor(walletName: string, desc: string, label: string): Promise<void>
  getBitcoinAddressDescriptorInfo(address: string): Promise<BitcoinDescriptorInfoResult>
  listTransactionsSinceBlock(walletName: string, blockhash: string): Promise<ListBitcoinWalletTransactionsSinceBlockResult>
  getAddressByLabel(walletName: string, label: string): Promise<AddressByLabelResult | undefined>
  getBlock(blockhash: string): Promise<BitcoinBlockResult | undefined>
  sendBitcoinTo(walletName: string, address: string, amount: number): Promise<void>
}

export class BitcoinWrapperServiceImpl implements BitcoinWrapperService {
  public constructor(private cacheService: CacheService) { }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "createwallet", "params": {"wallet_name":"descriptors"}}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443
  // {"result":{"name":"descriptors"},"error":null,"id":"curltest"}
  // {"result":null,"error":{"code":-4,"message":"Wallet file verification failed. Failed to create database path 'C:\\Users\\home\\AppData\\Roaming\\Bitcoin\\regtest\\wallets\\descriptors'. Database already exists."},"id":"curltest"}
  public async createBitcoinWallet(walletName: string, disablePrivateKeys: boolean): Promise<void> {
    try {
      await this.queryBitcoin<CreateBitcoinWalletResult>(
        '',
        'createwallet',
        {
          wallet_name: walletName,
          disable_private_keys: disablePrivateKeys
        }
      )
    } catch (err) {
      if (err instanceof BitcoinCoreError) {
        const bitcoinCoreError = err as BitcoinCoreError
        if (bitcoinCoreError.code === -4 && bitcoinCoreError.message.toLocaleLowerCase().includes('database already exists')) {
          return
        }
      }

      throw err
    }
  }

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

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "listwallets", "params": []}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/
  // {"result":["descriptors","janedoe_2","janedoe_1","descriptors1"],"error":null,"id":"curltest"}
  public async listBitcoinWallets(): Promise<string[]> {
    return await this.queryBitcoin<string[]>('', 'listwallets', [])
  }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getnewaddress", "params": ["", "bech32m"]}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/descriptors
  // {"result":"bcrt1p4c2lhx7mx33szyqtmjqtsxwcfnr3htjwsvwwk9v0m237fqz5l7gqgus887","error":null,"id":"curltest"}
  public async createBitcoinAddress(walletName: string, label: string): Promise<string> {
    return await this.queryBitcoin<string>(`wallet/${walletName}`, 'getnewaddress', { label: label.toLocaleLowerCase(), address_type: 'bech32m' })
  }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getbalance", "params": ["*", 6]}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/descriptors
  // {"result":0.00000000,"error":null,"id":"curltest"}
  public async getBitcoinBalance(walletName: string, minconf: number = 1): Promise<number> {
    return await this.queryBitcoinWithCaching<number>(`wallet/${walletName}`, 'getbalance', { minconf })
  }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getreceivedbylabel", "params": ["tabby", 6, true]}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/descriptors
  // {"result":0.00000000,"error":null,"id":"curltest"}
  // {"result":null,"error":{"code":-4,"message":"Label not found in wallet"},"id":"curltest"}
  public async receivedBitcoinByLabel(walletName: string, label: string, minconf: number, includeImmature: boolean): Promise<number> {
    return await this.queryBitcoinWithCaching<number>(`wallet/${walletName}`, 'getreceivedbylabel', { label: label.toLocaleLowerCase(), minconf, include_immature_coinbase: includeImmature })
  }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "sendall", "params": {"recipients": ["bcrt1qs3yav3vlqnckx4pm9mk6lfx550cuq8w67s0jcf"]}}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/uifte6jskp8
  // {"result":{"txid":"99640259bd077899faeabf8ea55c9ffef215f616a53a0ddd39a4b9a2044e9191","complete":true},"error":null,"id":"curltest"}
  public async withdrawBitcoin(walletName: string, address: string): Promise<WithdrawBitcoinWalletResult> {
    return await this.queryBitcoin<WithdrawBitcoinWalletResult>(`wallet/${walletName}`, 'sendall', { recipients: [address], options: { send_max: true } })
  }

  public async sendBitcoinTo(walletName: string, address: string, amount: number): Promise<void> {
    await this.queryBitcoin<SendBitcoinToResult>(`wallet/${walletName}`, 'sendtoaddress', { address, amount, subtractfeefromamount: true })
  }

  // curl -s --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "listsinceblock", "params": {"blockhash": "498f5ddfc4cf1da91ba7699c260cb43c088e21f2b97f87d9d5d8838bd29d30ef"}}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/bitcoin_central_wallet
  public async listTransactionsSinceBlock(walletName: string, blockhash: string): Promise<ListBitcoinWalletTransactionsSinceBlockResult> {
    return await this.queryBitcoinWithCaching<ListBitcoinWalletTransactionsSinceBlockResult>(`wallet/${walletName}`, 'listsinceblock', { blockhash })
  }

  // curl --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "importdescriptors", "params": {"requests":[{"desc":"addr(bcrt1p2h6sf5l0yrjqerkj4nwqlq3t4sq5n22u5xnwxe5rs4prqnp5rf5stv6kjy)#xgrz8vnd","timestamp":"now","label":"zbzbv6moya9ijsr1mqj9jj"}]}}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/bitcoin_central_wallet
  // {"result":[{"success":true}],"error":null,"id":"curltest"}
  public async importBitcoinDescriptor(walletName: string, desc: string, label: string): Promise<void> {
    await this.queryBitcoin<void>(`wallet/${walletName}`, 'importdescriptors',
      {
        requests: [
          {
            desc,
            label: label.toLocaleLowerCase(),
            timestamp: 'now'
          }
        ]
      }
    )
  }

  public async getBitcoinAddressDescriptorInfo(address: string): Promise<BitcoinDescriptorInfoResult> {
    return await this.queryBitcoinWithCaching<BitcoinDescriptorInfoResult>('', 'getdescriptorinfo', [`addr(${address})`])
  }

  // curl -s --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getaddressesbylabel", "params": {"label": "paymentid1"}}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443/wallet/janedoe_1
  // {"result":{"2N1nn27DXfdCf2gaRJGjHKZ9LRXKNKKRjNP":{"purpose":"receive"},"2N83C4qrRWKVraMhGzbqjyAtUj3E9KWFrug":{"purpose":"receive"},"2NCjQCP8zEvBpZH4h1Q6shZL1YhJZPFaMfv":{"purpose":"receive"},"bcrt1qtn3u59qzfwsyqt9azhnrj2uz63k5ka4a79vaq5":{"purpose":"receive"}},"error":null,"id":"curltest"}
  public async getAddressByLabel(walletName: string, label: string): Promise<AddressByLabelResult | undefined> {
    try {
      return await this.queryBitcoinWithCaching<AddressByLabelResult>(`wallet/${walletName}`, 'getaddressesbylabel', { label: label.toLocaleLowerCase() })
    } catch (err) {
      if (err instanceof BitcoinCoreError) {
        const bitcoinCoreError = err as BitcoinCoreError
        if (bitcoinCoreError.code === -11 && bitcoinCoreError.message.toLocaleLowerCase().includes('no addresses with label')) {
          return undefined
        }
      }

      throw err
    }
  }

  // curl -s --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblock", "params": {"blockhash": "5193bba8967a6624c563b2f6ab595d93ca0972b9f6345a5148b6e1de0f302dfa"}}' -H 'content-type: text/plain;' http://bitcoin:bitcoin@127.0.0.1:18443
  // {"result":{"hash":"5193bba8967a6624c563b2f6ab595d93ca0972b9f6345a5148b6e1de0f302dfa","confirmations":1,"height":948,"version":536870912,"versionHex":"20000000","merkleroot":"72ac7d0b3dc154746091c791ae28d8e5949d752744f374e4f6bd32a0ad75cfca","time":1696594582,"mediantime":1696594582,"nonce":1,"bits":"207fffff","difficulty":4.656542373906925e-10,"chainwork":"000000000000000000000000000000000000000000000000000000000000076a","nTx":1,"previousblockhash":"7538cf5373e98f9ed9268643a05427aa49218f71b6683c52473009fc5c1f48e8","strippedsize":214,"size":250,"weight":892,"tx":["72ac7d0b3dc154746091c791ae28d8e5949d752744f374e4f6bd32a0ad75cfca"]},"error":null,"id":"curltest"}
  public async getBlock(blockhash: string): Promise<BitcoinBlockResult | undefined> {
    return await this.queryBitcoinWithCaching<BitcoinBlockResult>('', 'getblock', { blockhash })
  }

  private async queryBitcoinWithCaching<T>(url: string, method: string, params: unknown): Promise<T> {
    return this.cacheService.run(
      `bitcoin${url}#${method}#${JSON.stringify(params)}`,
      DEFAULT_BITCOIN_CACHING_SECONDS,
      async () => {
        return await this.queryBitcoin<T>(url, method, params)
      }
    )
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
