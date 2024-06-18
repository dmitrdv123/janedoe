import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { BitcoinDao } from '@repo/dao/dist/src/dao/bitcoin.dao'
import { BitcoinBlock, BitcoinTransactionOutput, BitcoinUtxo, BitcoinUtxoDataKey, BitcoinWallet, BitcoinWalletAddress } from '@repo/dao/dist/src/interfaces/bitcoin'
import appConfig from '@repo/common/dist/src/app-config'

import { batchWriteItemsByChunks, generateKey, queryItems } from '../utils/dynamo-utils'
import { DynamoService } from '../services/dynamo.service'

export class BitcoinDaoImpl implements BitcoinDao {
  private static readonly PK_BLOCK_PREFIX = 'bitcoin#block_processed'
  private static readonly PK_LATEST_PROCESSED_BLOCK_PREFIX = 'bitcoin#block_processed_latest'
  private static readonly PK_FEE_RATE_PREFIX = 'bitcoin#fee_rate'
  private static readonly PK_WALLET_PREFIX = 'bitcoin#wallet'
  private static readonly PK_WALLET_ADDRESS_PREFIX = 'bitcoin#wallet_address'
  private static readonly PK_WALLET_ADDRESS_COUNTER_PREFIX = 'bitcoin#wallet_address_counter'
  private static readonly PK_UTXO_PREFIX = 'bitcoin#utxo'
  private static readonly PK_WALLET_BALANCE_PREFIX = 'bitcoin#wallet_balance'
  private static readonly PK_WALLET_ADDRESS_BALANCE_PREFIX = 'bitcoin#wallet_address_balance'
  private static readonly PK_TRANSACTION_PREFIX = 'bitcoin#transaction_output'

  public constructor(
    private dynamoService: DynamoService
  ) { }

  public async saveProcessedBlock(block: BitcoinBlock): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_BLOCK_PREFIX, block.hash),
        sk: block.hash,
        block
      })
    })
  }

  public async loadProcessedBlock(blockhash: string): Promise<BitcoinBlock | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_BLOCK_PREFIX, blockhash),
        sk: blockhash,
      })
    })
    return result.Item ? unmarshall(result.Item).block as BitcoinBlock : undefined
  }

  public async saveLatestProcessedBlock(block: BitcoinBlock): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_PREFIX,
        sk: BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_PREFIX,
        block
      })
    })
  }

  public async loadLatestProcessedBlock(): Promise<BitcoinBlock | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_PREFIX,
        sk: BitcoinDaoImpl.PK_LATEST_PROCESSED_BLOCK_PREFIX
      })
    })
    return result.Item ? unmarshall(result.Item).block as BitcoinBlock : undefined
  }

  public async saveFeeRate(feeRate: number): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: BitcoinDaoImpl.PK_FEE_RATE_PREFIX,
        sk: BitcoinDaoImpl.PK_FEE_RATE_PREFIX,
        feeRate
      })
    })
  }

  public async loadFeeRate(): Promise<number | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: BitcoinDaoImpl.PK_FEE_RATE_PREFIX,
        sk: BitcoinDaoImpl.PK_FEE_RATE_PREFIX
      })
    })
    return result.Item ? unmarshall(result.Item).feeRate as number : undefined
  }

  public async saveWallet(wallet: BitcoinWallet): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_PREFIX, wallet.walletName),
        sk: wallet.walletName,
        gsi_pk1: generateKey(BitcoinDaoImpl.PK_WALLET_PREFIX, wallet.data.address.toLocaleLowerCase()),
        gsi_sk1: wallet.data.address.toLocaleLowerCase(),
        wallet
      })
    })
  }

  public async loadWallet(walletName: string): Promise<BitcoinWallet | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_PREFIX, walletName),
        sk: walletName,
      })
    })
    return result.Item ? unmarshall(result.Item).wallet as BitcoinWallet : undefined
  }

  public async saveWalletAddress(walletAddress: BitcoinWalletAddress): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX, walletAddress.walletName),
        sk: walletAddress.label,
        gsi_pk1: generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX, walletAddress.data.address.toLocaleLowerCase()),
        gsi_sk1: walletAddress.data.address.toLocaleLowerCase(),
        walletAddress
      })
    })
  }

  public async loadWalletAddress(walletName: string, label: string): Promise<BitcoinWalletAddress | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX, walletName),
        sk: label
      })
    })
    return result.Item ? unmarshall(result.Item).walletAddress as BitcoinWalletAddress : undefined
  }

  public async loadWalletAddressByAddress(address: string): Promise<BitcoinWalletAddress | undefined> {
    const result = await this.dynamoService.queryItems({
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk1-gsi_sk1-index',
      KeyConditionExpression: 'gsi_pk1 = :pk and gsi_sk1= :sk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX, address.toLocaleLowerCase()),
        ':sk': address.toLocaleLowerCase()
      }),
      Limit: 1
    })

    return result.Items && result.Items.length > 0 ? unmarshall(result.Items[0]).walletAddress as BitcoinWalletAddress : undefined
  }

  public async listWalletAddresses(walletName: string): Promise<BitcoinWalletAddress[]> {
    return await queryItems(this.dynamoService, 'walletAddress', {
      TableName: appConfig.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_PREFIX, walletName)
      })
    })
  }

  public async updateWalletAddressCounter(walletName: string): Promise<number> {
    const result = await this.dynamoService.updateItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_COUNTER_PREFIX, walletName),
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

  public async saveUtxos(utxos: BitcoinUtxo[]): Promise<void> {
    const putRequests = utxos.map(utxo => ({
      PutRequest: {
        Item: marshall({
          pk: generateKey(BitcoinDaoImpl.PK_UTXO_PREFIX, utxo.data.txid),
          sk: utxo.data.vout.toString(),
          gsi_pk1: generateKey(BitcoinDaoImpl.PK_UTXO_PREFIX, utxo.walletName),
          gsi_sk1: utxo.walletName,
          utxo
        })
      }
    }))

    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      putRequests
    )
  }

  public async deleteUtxos(keys: BitcoinUtxoDataKey[]): Promise<void> {
    const deleteRequests = keys.map(key => ({
      DeleteRequest: {
        Key: marshall({
          pk: generateKey(BitcoinDaoImpl.PK_UTXO_PREFIX, key.txid),
          sk: key.vout.toString()
        })
      }
    }))

    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      deleteRequests
    )
  }

  public async listUtxos(walletName: string): Promise<BitcoinUtxo[]> {
    return await queryItems(this.dynamoService, 'utxo', {
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk1-gsi_sk1-index',
      KeyConditionExpression: 'gsi_pk1 = :pk and gsi_sk1= :sk',
      ExpressionAttributeValues: marshall({
        ':pk': generateKey(BitcoinDaoImpl.PK_UTXO_PREFIX, walletName),
        ':sk': walletName
      })
    })
  }

  public async saveWalletBalance(walletName: string, amount: number): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_BALANCE_PREFIX, walletName),
        sk: walletName,
        amount
      })
    })
  }

  public async loadWalletBalance(walletName: string): Promise<number | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_BALANCE_PREFIX, walletName),
        sk: walletName,
      })
    })
    return result.Item ? unmarshall(result.Item).amount as number : undefined
  }

  public async saveWalletAddressBalance(rootWalletName: string, walletName: string, amount: number): Promise<void> {
    await this.dynamoService.putItem({
      TableName: appConfig.TABLE_NAME,
      Item: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_BALANCE_PREFIX, rootWalletName),
        sk: walletName,
        amount
      })
    })
  }

  public async loadWalletAddressBalance(rootWalletName: string, walletName: string): Promise<number | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_WALLET_ADDRESS_BALANCE_PREFIX, rootWalletName),
        sk: walletName,
      })
    })
    return result.Item ? unmarshall(result.Item).amount as number : undefined
  }

  public async saveTransactionOutputs(transactionOutputs: BitcoinTransactionOutput[]): Promise<void> {
    const putRequests = transactionOutputs.map(transactionOutput => ({
      PutRequest: {
        Item: marshall({
          pk: generateKey(BitcoinDaoImpl.PK_TRANSACTION_PREFIX, transactionOutput.data.txid, transactionOutput.data.vout),
          sk: generateKey(transactionOutput.data.txid, transactionOutput.data.vout),
          gsi_pk2: BitcoinDaoImpl.PK_TRANSACTION_PREFIX,
          gsi_sk2: transactionOutput.data.blockheight,
          transactionOutput
        })
      }
    }))

    await batchWriteItemsByChunks(
      this.dynamoService,
      appConfig.TABLE_NAME,
      putRequests
    )
  }

  public async loadTransactionOutput(txid: string, vout: number): Promise<BitcoinTransactionOutput | undefined> {
    const result = await this.dynamoService.readItem({
      TableName: appConfig.TABLE_NAME,
      Key: marshall({
        pk: generateKey(BitcoinDaoImpl.PK_TRANSACTION_PREFIX, txid, vout),
        sk: generateKey(txid, vout),
      })
    })
    return result.Item ? unmarshall(result.Item).transactionOutput as BitcoinTransactionOutput : undefined
  }

  public async listTransactionOutputs(fromBlockheight: number, toBlockheight: number): Promise<BitcoinTransactionOutput[]> {
    return await queryItems(this.dynamoService, 'transactionOutput', {
      TableName: appConfig.TABLE_NAME,
      IndexName: 'gsi_pk2-gsi_sk2-index',
      KeyConditionExpression: 'gsi_pk2 = :pk AND gsi_sk2 BETWEEN :fromBlockheight AND :toBlockheight',
      ExpressionAttributeValues: marshall({
        ':pk': BitcoinDaoImpl.PK_TRANSACTION_PREFIX,
        ':fromBlockheight': fromBlockheight,
        ':toBlockheight': toBlockheight
      })
    })
  }
}
