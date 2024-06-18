import { BitcoinBlock } from '@repo/dao/dist/src/interfaces/bitcoin'
import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'


export interface Task {
  run(): void | Promise<void>
  getInterval(): number
}

export class BitcoinBlockTask implements Task {
  public constructor(
    private bitcoinBlockService: BitcoinBlockService,
    private interval: number
  ) { }

  public getInterval(): number {
    return this.interval
  }

  public async run(): Promise<void> {
    const latestProccessedBlock = await this.bitcoinBlockService.getLatestProcessedBlock()

    let blockhash: string | undefined
    if (latestProccessedBlock) {
      blockhash = latestProccessedBlock.nextblockhash
    } else {
      blockhash = await this.bitcoinBlockService.getBlockhash(0)
    }

    let block: BitcoinBlock | undefined = undefined
    while (blockhash) {
      block = await this.bitcoinBlockService.getBlock(blockhash)

      await this.bitcoinBlockService.processBlock(block)
      await this.bitcoinBlockService.updateLatestProcessedBlock(block)

      blockhash = block.nextblockhash
    }
  }
}
