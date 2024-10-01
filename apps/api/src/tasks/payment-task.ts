import { BlockchainMeta } from 'rango-sdk-basic'

import { NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'
import { CryptoService } from '@repo/common/dist/src/services/crypto-service'

import { logger } from '../utils/logger'
import { Task } from './task-manager'
import { NotificationService } from '../services/notification-service'
import { PaymentLogsIteratorBuilder } from '../services/payment-logs/payment-logs-iterator-builder'
import { PaymentLogService } from '../services/payment-log-service'
import { AccountService } from '../services/account-service'
import { MetaService } from '../services/meta-service'
import { SettingsService } from '../services/settings-service'

export class PaymentTask implements Task {
  public constructor(
    private blockchain: BlockchainMeta,
    private lastProcessed: string | undefined,
    private accountService: AccountService,
    private evmService: EvmService,
    private bitcoinBlockService: BitcoinBlockService,
    private metaService: MetaService,
    private notificationService: NotificationService,
    private paymentLogService: PaymentLogService,
    private cryptoService: CryptoService,
    private settingsService: SettingsService,
  ) { }

  public async run(): Promise<void> {
    try {
      logger.debug(`PaymentTask: payment task start for ${this.blockchain.name}`)
      await this.processBlockchain()
    } catch (error) {
      logger.error(`PaymentTask: error happens for ${this.blockchain.name}`)
      logger.error(error)
    }
  }

  private async processBlockchain(): Promise<void> {
    logger.debug(`PaymentTask, ${this.blockchain.name}: last processed payments logs ${this.lastProcessed ?? 'undefined'}`)

    const iterator = await new PaymentLogsIteratorBuilder(
      this.settingsService,
      this.accountService,
      this.evmService,
      this.bitcoinBlockService,
      this.metaService
    )
      .withSkip(this.lastProcessed)
      .build(this.blockchain)

    const logs = await iterator.nextBatch()
    logger.debug(`PaymentTask, ${this.blockchain.name}: found ${logs.length} payments logs`)

    logger.debug(`PaymentTask, ${this.blockchain.name}: start to create notifications`)
    await Promise.all(
      logs.map(async (log) => await this.processPaymentLog(log))
    )

    if (this.lastProcessed === iterator.lastProcessed()) {
      logger.debug(`PaymentTask, ${this.blockchain.name}: skip to save last processed payment logs since no new blocks found`)
    } else {
      logger.debug(`PaymentTask, ${this.blockchain.name}: start to save last processed payment logs ${iterator.lastProcessed()}`)
      await this.settingsService.saveBlockchainSettings({
        blockchain: this.blockchain.name,
        block: iterator.lastProcessed()
      })

      this.lastProcessed = iterator.lastProcessed()
    }
    logger.debug(`PaymentTask, ${this.blockchain.name}: end to save last processed payment logs ${iterator.lastProcessed()}`)
  }

  private async processPaymentLog(log: PaymentLog): Promise<void> {
    const key = [log.accountId, log.paymentId, this.cryptoService.generateRandom(5)].join('#')

    await Promise.all([
      this.paymentLogService.savePaymentLog(log),
      this.notificationService.createNotification(
        key,
        NotificationType.PAYMENT,
        log.timestamp,
        log
      ),
      this.notificationService.createNotification(
        key,
        NotificationType.IPN,
        log.timestamp,
        log
      )
    ])
  }
}
