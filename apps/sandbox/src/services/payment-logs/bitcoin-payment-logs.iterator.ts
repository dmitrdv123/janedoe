import { BitcoinBlockService } from '@repo/bitcoin/dist/src/services/bitcoin-block.service'

export class BitcoinPaymentLogsIterator {
  private blockhash: string | undefined = undefined

  public constructor(
    private bitcoinBlockService: BitcoinBlockService
  ) {
  }

  public lastProcessed(): string | undefined {
    return this.blockhash
  }

  public skip(lastProcessed: string): void {
    this.blockhash = lastProcessed
  }

  public async nextBatch(): Promise<void> {
    let fromHeight = 0
    let toHeight = 0

    const lastProcessedBlock = await this.bitcoinBlockService.getLatestProcessedBlock()
    if (!lastProcessedBlock) {
      return
    }
    toHeight = lastProcessedBlock.height

    if (this.blockhash) {
      const block = await this.bitcoinBlockService.getProcessedBlock(this.blockhash)
      if (!block) {
        throw new Error(`Block ${this.blockhash} not found`)
      }
      fromHeight = block.height + 1
    } else {
      fromHeight = 0
    }

    if (fromHeight > toHeight) {
      return
    }

    const transactionOutputs = await this.bitcoinBlockService.listBlockTransactionOutputs(fromHeight, toHeight)
    console.log(`debug >> found ${transactionOutputs.length} transaction outputs from ${fromHeight} to ${toHeight}`)

    this.blockhash = lastProcessedBlock.hash
  }
}
