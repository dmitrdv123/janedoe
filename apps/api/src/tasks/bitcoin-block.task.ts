import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'

import { logger } from '../utils/logger'
import { Task } from './task-manager'

export class BitcoinBlockTask implements Task {
  public constructor(
    private bitcoinBlockService: BitcoinBlockService
  ) { }

  public async run(): Promise<void> {
    try {
      logger.debug('BitcoinBlockTask: task start')

      let latestProcessedBlockHeight = await this.bitcoinBlockService.getLatestProcessedBlockHeight()
      if (latestProcessedBlockHeight === undefined) {
        latestProcessedBlockHeight = -1
      }

      const fromHeight = latestProcessedBlockHeight + 1
      const toHeight: number = await this.bitcoinBlockService.getLatestBlockHeight()

      logger.debug(`BitcoinBlockTask: start to iterate over blocks from height ${fromHeight} to height ${toHeight}`)
      for (let i = fromHeight; i <= toHeight; ++i) {
        logger.debug(`BitcoinBlockTask: start to get block hash for height ${i}`)
        const blockhash = await this.bitcoinBlockService.getBlockhash(i)
        logger.debug(`BitcoinBlockTask: end to get block hash for height ${i}: ${blockhash}`)

        logger.debug(`BitcoinBlockTask: start to get block ${blockhash}`)
        const block = await this.bitcoinBlockService.getBlock(blockhash)
        logger.debug(`BitcoinBlockTask: end to get block ${blockhash}`)

        logger.debug(`BitcoinBlockTask: start to process block ${blockhash}`)
        await this.bitcoinBlockService.processBlock(block)
        logger.debug(`BitcoinBlockTask: end to process block ${blockhash}`)

        logger.debug(`BitcoinBlockTask: start to update latest processed block height to ${i}`)
        await this.bitcoinBlockService.updateLatestProcessedBlockHeight(i)
        logger.debug(`BitcoinBlockTask: end to update latest processed block height to ${i}`)
      }
      logger.debug(`BitcoinBlockTask: end to iterate over blocks from height ${fromHeight} to height ${toHeight}`)

      if (fromHeight <= toHeight) {
        logger.debug('BitcoinBlockTask: start to refresh fee rate')
        await this.tryRefreshFeeRate()
        logger.debug('BitcoinBlockTask: end to refresh fee rate')
      }
    } catch (error) {
      logger.error(`BitcoinBlockTask: error happens`)
      logger.error(error)
    }
  }

  private async tryRefreshFeeRate(): Promise<void> {
    try {
      const refreshed = await this.bitcoinBlockService.refreshFeeRate()
      if (!refreshed) {
        logger.warn(`BitcoinBlockTask: could not refresh fee rate`)
      }
    } catch (error) {
      logger.warn(`BitcoinBlockTask: could not refresh fee rate`)
      logger.warn(error)
    }
  }
}
