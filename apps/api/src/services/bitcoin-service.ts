import BetterLock from 'better-lock'

import { ListBitcoinWalletTransactionsSinceBlockResult, WithdrawBitcoinWalletResult } from '@repo/common/src/interfaces/bitcoin'
import { ACCOUNT_ID_LENGTH, BITCOIN_INCLUDE_IMMATURE, BITCOIN_MINCONF } from '@repo/common/src/constants'
import { BitcoinWrapperService } from '@repo/common/src/services/bitcoin-wrapper-service'
import { MetricDao } from '@repo/dao/dist/src/dao/metric.dao'

export interface BitcoinService {
  createBitcoinWallet(walletName: string, disablePrivateKeys: boolean): Promise<void>
  createBitcoinAddress(walletName: string, label: string): Promise<string>
  importBitcoinAddress(walletName: string, address: string, label: string): Promise<void>
  getBitcoinBalance(walletName: string): Promise<number>
  receivedBitcoinByLabel(walletName: string, label: string): Promise<number>
  withdrawBitcoin(walletName: string, address: string): Promise<WithdrawBitcoinWalletResult>
  listBitcoinTransactionsSinceBlock(walletName: string, blockhash: string): Promise<ListBitcoinWalletTransactionsSinceBlockResult>
}

export class BitcoinServiceImpl implements BitcoinService {
  private lock = new BetterLock({
    name: 'BitcoinService',            // To be used in error reporting and logging
    wait_timeout: 1000 * 30,           // Max 30 sec wait in queue
    execution_timeout: 1000 * 60 * 5,  // Time out after 5 minutes
  });

  public constructor(
    private bitcoinWrapperService: BitcoinWrapperService,
    private metricDao: MetricDao
  ) { }

  public async createBitcoinWallet(walletName: string, disablePrivateKeys: boolean): Promise<void> {
    await this.lock.acquire(async () => {
      try {
        await this.bitcoinWrapperService.createBitcoinWallet(walletName, disablePrivateKeys)
      } catch (error) {
        await this.metricDao.putBitcoinErrorMetric(1)
        throw error
      }
    })
  }

  public async createBitcoinAddress(walletName: string, label: string): Promise<string> {
    return await this.lock.acquire(async () => {
      try {
        await this.loadBitcoinWallet(walletName)

        const addressByLabel = await this.bitcoinWrapperService.getAddressByLabel(walletName, label)
        if (addressByLabel) {
          const address = Object.keys(addressByLabel).find(key => addressByLabel[key].purpose.toLocaleLowerCase() === "receive")
          if (address) {
            return address
          }
        }

        return await this.bitcoinWrapperService.createBitcoinAddress(walletName, label)
      } catch (error) {
        await this.metricDao.putBitcoinErrorMetric(1)
        throw error
      } finally {
        await this.tryUnloadBitcoinWallet(walletName)
      }
    })
  }

  public async importBitcoinAddress(walletName: string, address: string, label: string): Promise<void> {
    return await this.lock.acquire(async () => {
      try {
        await this.loadBitcoinWallet(walletName)
        const descriptor = await this.bitcoinWrapperService.getBitcoinAddressDescriptorInfo(address)
        return await this.bitcoinWrapperService.importBitcoinDescriptor(walletName, descriptor.descriptor, label)
      } catch (error) {
        await this.metricDao.putBitcoinErrorMetric(1)
        throw error
      } finally {
        await this.tryUnloadBitcoinWallet(walletName)
      }
    })
  }

  public async getBitcoinBalance(walletName: string): Promise<number> {
    return await this.lock.acquire(async () => {
      try {
        await this.loadBitcoinWallet(walletName)
        return await this.bitcoinWrapperService.getBitcoinBalance(walletName, BITCOIN_MINCONF)
      } catch (error) {
        await this.metricDao.putBitcoinErrorMetric(1)
        throw error
      } finally {
        await this.tryUnloadBitcoinWallet(walletName)
      }
    })
  }

  public async receivedBitcoinByLabel(walletName: string, label: string): Promise<number> {
    return await this.lock.acquire(async () => {
      try {
        await this.loadBitcoinWallet(walletName)
        return await this.bitcoinWrapperService.receivedBitcoinByLabel(walletName, label, BITCOIN_MINCONF, BITCOIN_INCLUDE_IMMATURE)
      } catch (error) {
        throw error
      } finally {
        await this.tryUnloadBitcoinWallet(walletName)
      }
    })
  }

  public async withdrawBitcoin(walletName: string, address: string): Promise<WithdrawBitcoinWalletResult> {
    return await this.lock.acquire(async () => {
      try {
        await this.loadBitcoinWallet(walletName)
        return await this.bitcoinWrapperService.withdrawBitcoin(walletName, address)
      } catch (error) {
        await this.metricDao.putBitcoinErrorMetric(1)
        throw error
      } finally {
        await this.tryUnloadBitcoinWallet(walletName)
      }
    })
  }

  public async listBitcoinTransactionsSinceBlock(walletName: string, blockhash: string): Promise<ListBitcoinWalletTransactionsSinceBlockResult> {
    return await this.lock.acquire(async () => {
      try {
        await this.loadBitcoinWallet(walletName)
        const result = await this.bitcoinWrapperService.listTransactionsSinceBlock(walletName, blockhash)

        return {
          transactions: result.transactions.filter(
            item => item.confirmations > 0 && item.label && item.label.length > ACCOUNT_ID_LENGTH && item.category.toLocaleLowerCase() === 'receive'
          ),
          removed: result.removed.filter(
            item => item.confirmations > 0 && item.label && item.label.length > ACCOUNT_ID_LENGTH && item.category.toLocaleLowerCase() === 'receive'
          ),
          lastblock: result.lastblock
        }
      } catch (error) {
        await this.metricDao.putBitcoinErrorMetric(1)
        throw error
      } finally {
        await this.tryUnloadBitcoinWallet(walletName)
      }
    })
  }

  private async loadBitcoinWallet(walletName: string): Promise<void> {
    const wallets = await this.bitcoinWrapperService.listBitcoinWallets()
    if (wallets.findIndex(item => item === walletName) !== -1) {
      return
    }

    await this.bitcoinWrapperService.loadBitcoinWallet(walletName)
  }

  private async tryUnloadBitcoinWallet(walletName: string): Promise<void> {
    try {
      await this.bitcoinWrapperService.unloadBitcoinWallet(walletName)
    } catch { }
  }
}
