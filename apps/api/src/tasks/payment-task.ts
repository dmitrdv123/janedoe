import { BlockchainMeta } from 'rango-sdk-basic'

import { NotificationType } from '@repo/dao/dist/src/interfaces/notification'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'

import { logger } from '../utils/logger'
import { Task } from './task-manager'
import { NotificationService } from '../services/notification-service'
import { PaymentLogsIteratorBuilder } from '../services/payment-logs/payment-logs-iterator-builder'
import { PaymentLogService } from '../services/payment-log-service'
import { AccountService } from '../services/account-service'
import { MetaService } from '../services/meta-service'
import { CryptoService } from '../services/crypto-service'
import { SettingsService } from '../services/settings-service'

export class PaymentTask implements Task {
  public constructor(
    private accountService: AccountService,
    private evmService: EvmService,
    private bitcoinBlockService: BitcoinBlockService,
    private metaService: MetaService,
    private notificationService: NotificationService,
    private paymentLogService: PaymentLogService,
    private cryptoService: CryptoService,
    private settingsService: SettingsService,
    private interval: number
  ) { }

  public getInterval(): number {
    return this.interval
  }

  public async run(): Promise<void> {
    try {
      logger.info(`PaymentTask: payment task start`)

      const [appSettings, meta] = await Promise.all([
        this.settingsService.loadAppSettings(),
        this.metaService.meta()
      ])

      await Promise.all(
        appSettings.paymentBlockchains.map(async paymentBlockchain => {
          try {
            const blockchain = meta.blockchains.find(item => item.name.toLocaleLowerCase() === paymentBlockchain.blockchain.toLocaleLowerCase())
            if (!blockchain) {
              logger.debug(`PaymentTask: blockchain ${paymentBlockchain} not found`)
              return
            }

            logger.debug(`PaymentTask: start to process payment logs for ${blockchain.name}`)
            await this.processBlockchain(blockchain)
          } catch (error) {
            logger.error(`PaymentTask: error happens for ${paymentBlockchain.blockchain}`)
            logger.error(error)
          }
        })
      )
    } catch (error) {
      logger.error(`PaymentTask: error happens`)
      logger.error(error)
    }
  }

  private async processBlockchain(blockchain: BlockchainMeta): Promise<void> {
    const blockchainSettings = await this.settingsService.loadBlockchainSettings(blockchain.name)
    const lastProcessed = blockchainSettings?.block ?? undefined
    logger.debug(`PaymentTask, ${blockchain.name}: last processed payments logs ${lastProcessed ?? 'undefined'}`)

    const iterator = await new PaymentLogsIteratorBuilder(
      this.settingsService,
      this.accountService,
      this.evmService,
      this.bitcoinBlockService,
      this.metaService
    )
      .withSkip(lastProcessed)
      .build(blockchain)

    logger.debug(`PaymentTask, ${blockchain.name}: start to find payments logs`)
    const logs = await iterator.nextBatch()
    logger.debug(`PaymentTask, ${blockchain.name}: found ${logs.length} payments logs`)

    logger.debug(`PaymentTask, ${blockchain.name}: start to create notifications`)
    await Promise.all(
      logs.map(async (log) => await this.processPaymentLog(log))
    )

    if (lastProcessed === iterator.lastProcessed()) {
      logger.debug(`PaymentTask, ${blockchain.name}: skip to save last processed payment logs since no new blocks found`)
    } else {
      logger.debug(`PaymentTask, ${blockchain.name}: start to save last processed payment logs ${iterator.lastProcessed()}`)
      await this.settingsService.saveBlockchainSettings({
        blockchain: blockchain.name,
        block: iterator.lastProcessed()
      })
    }
    logger.debug(`PaymentTask, ${blockchain.name}: end to save last processed payment logs ${iterator.lastProcessed()}`)
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
