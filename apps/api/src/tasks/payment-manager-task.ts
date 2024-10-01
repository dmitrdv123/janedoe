import { EvmService } from '@repo/evm/dist/src/services/evm-service'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'
import { CryptoService } from '@repo/common/dist/src/services/crypto-service'

import { logger } from '../utils/logger'
import { Task, TaskManager } from './task-manager'
import { NotificationService } from '../services/notification-service'
import { PaymentLogService } from '../services/payment-log-service'
import { AccountService } from '../services/account-service'
import { MetaService } from '../services/meta-service'
import { SettingsService } from '../services/settings-service'
import { PaymentTask } from './payment-task'
import { PAYMENT_TASK_INTERVAL_SECONDS } from '../constants'
import { AppSettingsBlockchain } from '@repo/dao/dist/src/interfaces/settings'

export class PaymentManagerTask implements Task {
  private prevPaymentBlockchains: AppSettingsBlockchain[] = []

  public constructor(
    private taskManager: TaskManager,
    private settingsService: SettingsService,
    private metaService: MetaService,
    private accountService: AccountService,
    private evmService: EvmService,
    private bitcoinBlockService: BitcoinBlockService,
    private notificationService: NotificationService,
    private paymentLogService: PaymentLogService,
    private cryptoService: CryptoService
  ) { }

  public async run(): Promise<void> {
    try {
      logger.debug(`PaymentManagerTask: task start`)
      await this.process()
    } catch (error) {
      logger.error(`PaymentManagerTask: error happens`)
      logger.error(error)
    }
  }

  private async process(): Promise<void> {
    logger.debug('PaymentManagerTask: start to init task manager')

    const [appSettings, meta] = await Promise.all([
      this.settingsService.loadAppSettings(),
      this.metaService.meta()
    ])

    await Promise.all(
      appSettings.paymentBlockchains.map(async paymentBlockchain => {
        logger.debug(`PaymentManagerTask: start to add payment task for ${paymentBlockchain.blockchain} into task manager`)

        if (this.prevPaymentBlockchains.find(item => item.blockchain.toLocaleLowerCase() === paymentBlockchain.blockchain.toLocaleLowerCase())) {
          return
        }

        const blockchain = meta.blockchains.find(item => item.name.toLocaleLowerCase() === paymentBlockchain.blockchain.toLocaleLowerCase())
        if (!blockchain) {
          logger.debug(`PaymentManagerTask: blockchain ${paymentBlockchain} not found`)
          return
        }

        const blockchainSettings = await this.settingsService.loadBlockchainSettings(blockchain.name)
        const lastProcessed = blockchainSettings?.block ?? undefined

        const task = new PaymentTask(
          blockchain,
          lastProcessed,
          this.accountService,
          this.evmService,
          this.bitcoinBlockService,
          this.metaService,
          this.notificationService,
          this.paymentLogService,
          this.cryptoService,
          this.settingsService,
        )

        this.taskManager.add(paymentBlockchain.blockchain, task, PAYMENT_TASK_INTERVAL_SECONDS)

        logger.debug(`PaymentManagerTask: end to add payment task for ${paymentBlockchain.blockchain} into task manager`)
      })
    )

    this.prevPaymentBlockchains.forEach(paymentBlockchain => {
      logger.debug(`PaymentManagerTask: start to delete payment task for ${paymentBlockchain.blockchain} from task manager`)

      if (appSettings.paymentBlockchains.find(item => item.blockchain.toLocaleLowerCase() === paymentBlockchain.blockchain.toLocaleLowerCase())) {
        logger.debug(`PaymentManagerTask: skip to delete payment task for ${paymentBlockchain.blockchain} from task manager`)
        return
      }

      this.taskManager.remove(paymentBlockchain.blockchain)

      logger.debug(`PaymentManagerTask: end to delete payment task for ${paymentBlockchain.blockchain} from task manager`)
    })

    this.prevPaymentBlockchains = appSettings.paymentBlockchains

    logger.debug('PaymentManagerTask: end to init task manager')
  }
}
