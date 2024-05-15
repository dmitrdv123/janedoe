import { BitcoinService } from '@repo/common/dist/src/services/bitcoin-service'
import { MetricDao } from '@repo/dao/dist/src/dao/metric.dao'
import { ListBitcoinWalletTransactionsSinceBlockResult, WithdrawBitcoinWalletResult } from '@repo/common/dist/src/interfaces/bitcoin'

export class BitcoinServiceProxyImpl implements BitcoinService {
  public constructor(
    private bitcoinService: BitcoinService,
    private metricDao: MetricDao
  ) { }

  public async createBitcoinWallet(walletName: string, disablePrivateKeys: boolean): Promise<void> {
    try {
      return await this.bitcoinService.createBitcoinWallet(walletName, disablePrivateKeys)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }

  public async createBitcoinAddress(walletName: string, label: string): Promise<string> {
    try {
      return await this.bitcoinService.createBitcoinAddress(walletName, label)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }

  public async importBitcoinAddress(walletName: string, address: string, label: string): Promise<void> {
    try {
      return await this.bitcoinService.importBitcoinAddress(walletName, address, label)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }

  public async getBitcoinBalance(walletName: string): Promise<number> {
    try {
      return await this.bitcoinService.getBitcoinBalance(walletName)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }

  public async receivedBitcoinByLabel(walletName: string, label: string): Promise<number> {
    try {
      return await this.bitcoinService.receivedBitcoinByLabel(walletName, label)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }

  public async withdrawBitcoin(walletName: string, address: string): Promise<WithdrawBitcoinWalletResult> {
    try {
      return await this.bitcoinService.withdrawBitcoin(walletName, address)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }

  public async listBitcoinTransactionsSinceBlock(walletName: string, blockhash: string): Promise<ListBitcoinWalletTransactionsSinceBlockResult> {
    try {
      return await this.bitcoinService.listBitcoinTransactionsSinceBlock(walletName, blockhash)
    } catch (error) {
      await this.metricDao.putBitcoinErrorMetric(1)
      throw error
    }
  }
}
