import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress, BitcoinWalletAddressKey, BitcoinWalletTransaction } from '@repo/dao/dist/src/interfaces/bitcoin'
import { CacheService } from '@repo/common/dist/src/services/cache-service'
import appConfig from '@repo/common/dist/src/app-config'

import { batchReadItemsByChunks, batchWriteItemsByChunks, generateKey, queryItems } from '../utils/dynamo-utils'
import { DynamoService } from '../services/dynamo.service'
import { decryptString, encryptString } from '../utils/crypto-utils'

export class BitcoinDaoImpl implements BitcoinDao {
  private static readonly PK_PREFIX = 'btc'
  private static readonly PK_LATEST_PROCESSED_BLOCK_HEIGHT_PREFIX = 'block_processed_height_latest'
  private static readonly PK_FEE_RATE_PREFIX = 'fee_rate'
  private static readonly PK_WALLET_PREFIX = 'wallet'
  private static readonly PK_WALLET_ADDRESS_PREFIX = 'wallet_address'
  private static readonly PK_WALLET_ADDRESS_COUNTER_PREFIX = 'wallet_address_counter'
  private static readonly PK_UTXO_PREFIX = 'utxo'
  private static readonly PK_TRANSACTION_PREFIX = 'transaction_output'

  public constructor(
    private dynamoService: DynamoService,
    private cacheService: CacheService
  ) { }

  public async saveLatestProcessedBlockHeight(height: number): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_HEIGHT_PREFIX),
        sk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_HEIGHT_PREFIX),
        height
      })
    })
  }

  public async loadLatestProcessedBlockHeight(): Promise<number | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_HEIGHT_PREFIX),
        sk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_HEIGHT_PREFIX)
      })
    })
    return result.Item ? unmarshall(result.Item).height as number : undefined
  }

  public async saveFeeRate(feeRate: number): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_FEE_RATE_PREFIX),
        sk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_FEE_RATE_PREFIX),
        feeRate
      })
    })
  }

  public async loadFeeRate(): Promise<number | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_FEE_RATE_PREFIX),
        sk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_FEE_RATE_PREFIX)
      })
    })
    return result.Item ? unmarshall(result.Item).feeRate as number : undefined
  }

  public async saveWallet(wallet: BitcoinWallet): Promise<void> {
    const walletToSave: BitcoinWallet = { ...wallet }
    walletToSave.data.wif = encryptString(wallet.data.wif, appConfig.CRYPTO_SEED)

    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_PREFIX, wallet.walletName),
        sk: wallet.walletName,
        gsi_pk1: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_PREFIX, wallet.data.address.toLocaleLowerCase()),
        gsi_sk1: wallet.data.address.toLocaleLowerCase(),
        wallet: walletToSave
      })
    })
  }

  public async loadWallet(walletName: string): Promise<BitcoinWallet | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_PREFIX, walletName),
        sk: walletName,
      })
    })

    const wallet = result.Item ? unmarshall(result.Item).wallet as BitcoinWallet : undefined
    if (wallet) {
      wallet.data.wif = decryptString(wallet.data.wif, appConfig.CRYPTO_SEED)
    }

    return wallet
  }

  public async saveWalletAddress(walletAddress: BitcoinWalletAddress): Promise<void> {
    const walletAddressToSave: BitcoinWalletAddress = { ...walletAddress }
    walletAddressToSave.data.wif = encryptString(walletAddress.data.wif, appConfig.CRYPTO_SEED)

    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX),
        sk: generateKey(walletAddress.walletName, walletAddress.label),
        walletAddress: walletAddressToSave
      })
    })

    this.cacheService.set(`wallet_address#${walletAddress.data.address}`, walletAddress)
  }

  public async loadWalletAddress(walletName: string, label: string): Promise<BitcoinWalletAddress | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX),
        sk: generateKey(walletName, label),
      })
    })

    const walletAddress = result.Item ? unmarshall(result.Item).walletAddress as BitcoinWalletAddress : undefined
    if (walletAddress) {
      walletAddress.data.wif = decryptString(walletAddress.data.wif, appConfig.CRYPTO_SEED)
    }

    return walletAddress
  }

  public async loadWalletAddresses(walletAddressKeys: BitcoinWalletAddressKey[]): Promise<BitcoinWalletAddress[]> {
    const keys = walletAddressKeys.map(walletAddressKey => ({
      pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX),
      sk: generateKey(walletAddressKey.walletName, walletAddressKey.label)
    }))

    const walletAddresses = await batchReadItemsByChunks<BitcoinWalletAddress>(
      this.dynamoService,
      appConfig.TABLE_NAME,
      'walletAddress',
      keys.map(key => marshall(key))
    )

    return walletAddresses.map(walletAddress => {
      walletAddress.data.wif = decryptString(walletAddress.data.wif, appConfig.CRYPTO_SEED)
      return walletAddress
    })
  }

  public async listWalletAddresses(walletName: string): Promise<BitcoinWalletAddress[]> {
    const walletAddresses: BitcoinWalletAddress[] = await queryItems(this.dynamoService, 'walletAddress', {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_prefix)',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX),
        ':sk_prefix': generateKey(walletName, '')
      })
    })

    return walletAddresses.map(item => {
      const walletAddress: BitcoinWalletAddress = { ...item }
      walletAddress.data.wif = decryptString(walletAddress.data.wif, appConfig.CRYPTO_SEED)
      return walletAddress
    })
  }

  public async listAllWalletAddresses(): Promise<BitcoinWalletAddress[]> {
    return await queryItems(this.dynamoService, 'walletAddress', {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX)
      })
    })
  }

  public async updateWalletAddressCounter(walletName: string): Promise<number> {
    const result = await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_WALLET_ADDRESS_COUNTER_PREFIX, walletName),
        sk: walletName
      }),
      UpdateExpression: `ADD address_counter :incr`,
      ExpressionAttributeValues: marshall({
        ':incr': 1
      }),
      ReturnValues: "UPDATED_NEW"
    })

    return result.Attributes ? unmarshall(result.Attributes).address_counter as number : 0
  }

  public async saveUtxos(utxos: BitcoinUtxo[], active: boolean): Promise<void> {
    const putRequests = utxos.map(utxo => ({
      PutRequest: {
        Item: marshall({
          pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX),
          sk: generateKey(utxo.data.txid, utxo.data.vout),
          gsi_pk1: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX, utxo.walletName),
          gsi_sk1: utxo.label,
          active,
          utxo
        })
      }
    }))

    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      putRequests
    )

    utxos.forEach(utxo => this.cacheService.set(`utxo#${utxo.data.txid}#${utxo.data.vout}`, utxo))
  }

  public async loadUtxo(key: BitcoinUtxoDataKey, active: boolean): Promise<BitcoinUtxo | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX),
        sk: generateKey(key.txid, key.vout)
      })
    })

    if (result.Item) {
      const item = unmarshall(result.Item)
      if (item.active === active) {
        return item.utxo
      }
    }

    return undefined
  }

  public async deleteUtxos(keys: BitcoinUtxoDataKey[]): Promise<void> {
    const deleteRequests = keys.map(key => ({
      DeleteRequest: {
        Key: marshall({
          pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX),
          sk: generateKey(key.txid, key.vout)
        })
      }
    }))

    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      deleteRequests
    )

    keys.forEach(key => this.cacheService.del(`utxo#${key.txid}#${key.vout}`))
  }

  public async listWalletUtxos(walletName: string, active: boolean): Promise<BitcoinUtxo[]> {
    return await queryItems(this.dynamoService, 'utxo', {
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk1-gsi_sk1-index',
      KeyConditionExpression: 'gsi_pk1 = :pk',
      FilterExpression: 'active = :active',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX, walletName),
        ':active': active
      })
    })
  }

  public async listWalletAddressUtxos(walletName: string, label: string, active: boolean): Promise<BitcoinUtxo[]> {
    return await queryItems(this.dynamoService, 'utxo', {
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk1-gsi_sk1-index',
      KeyConditionExpression: 'gsi_pk1 = :pk and gsi_sk1= :sk',
      FilterExpression: 'active = :active',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX, walletName),
        ':sk': label,
        ':active': active
      })
    })
  }

  public async listAllUtxos(): Promise<BitcoinUtxo[]> {
    return await queryItems(this.dynamoService, 'utxo', {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_UTXO_PREFIX)
      })
    })
  }

  public async loadWalletBalance(walletName: string): Promise<number> {
    const utxos = await this.listWalletUtxos(walletName, true)

    return utxos.reduce((acc, utxo) => {
      acc += utxo.data.amount
      return acc
    }, 0)
  }

  public async loadWalletAddressBalance(walletName: string, label: string): Promise<number> {
    const utxos = await this.listWalletAddressUtxos(walletName, label, true)

    return utxos.reduce((acc, utxo) => {
      acc += utxo.data.amount
      return acc
    }, 0)
  }

  public async saveWalletTransactions(walletTransactions: BitcoinWalletTransaction[]): Promise<void> {
    const putRequests = walletTransactions.map(tx => ({
      PutRequest: {
        Item: marshall({
          pk: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_TRANSACTION_PREFIX),
          sk: generateKey(tx.walletName, tx.label, tx.data.txid, tx.data.vout),
          gsi_pk2: generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_TRANSACTION_PREFIX),
          gsi_sk2: tx.data.blockheight,
          transactionOutput: tx
        })
      }
    }))

    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      putRequests
    )
  }

  public async listWalletTransactions(fromBlockheight: number, toBlockheight: number): Promise<BitcoinWalletTransaction[]> {
    return await queryItems(this.dynamoService, 'transactionOutput', {
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk2-gsi_sk2-index',
      KeyConditionExpression: 'gsi_pk2 = :pk AND gsi_sk2 BETWEEN :fromBlockheight AND :toBlockheight',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_PREFIX, BitcoinDaoImpl.PK_TRANSACTION_PREFIX),
        ':fromBlockheight': fromBlockheight,
        ':toBlockheight': toBlockheight
      })
    })
  }
}
