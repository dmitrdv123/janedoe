import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'

import { BitcoinService } from '@repo/common/dist/src/services/bitcoin-service'
import { EvmService } from '@repo/evm/dist/src/services/evm-service'

import { SettingsService } from '../settings-service'
import { getAddressOrDefault } from '../../utils/utils'
import { PaymentLogsIterator } from './payment-logs-iterator'
import { EvmPaymentLogsIterator } from './evm-payment-logs-iterator'
import { BitcoinPaymentLogsIterator } from './bitcoin-payment-logs-iterator'
import { BLOCKCHAIN_BTC } from '../../constants'
import { AccountService } from '../account-service'
import { MetaService } from '../meta-service'

export class PaymentLogsIteratorBuilder {
  private lastProcessed: string | undefined = undefined

  public constructor(
    private settingsService: SettingsService,
    private accountService: AccountService,
    private evmService: EvmService,
    private bitcoinService: BitcoinService,
    private metaService: MetaService
  ) { }

  public withSkip(lastProcessed: string | undefined): PaymentLogsIteratorBuilder {
    this.lastProcessed = lastProcessed
    return this
  }

  public async build(blockchain: BlockchainMeta): Promise<PaymentLogsIterator> {
    let result: PaymentLogsIterator | undefined = undefined

    switch (blockchain.type) {
      case TransactionType.TRON:
      case TransactionType.EVM:
        const appSettings = await this.settingsService.loadAppSettings()

        const contracts = appSettings.contracts.find(
          item => item.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
        )
        const janeDoeAddress = getAddressOrDefault(contracts?.contractAddresses.JaneDoe)
        const wrappedNativeAddress = getAddressOrDefault(contracts?.contractAddresses.WrappedNative)
        if (!janeDoeAddress || !wrappedNativeAddress) {
          throw new Error(`Blockchain ${blockchain.name} is not supported`)
        }

        result = new EvmPaymentLogsIterator(blockchain, janeDoeAddress, wrappedNativeAddress, this.accountService, this.evmService, this.metaService, this.settingsService)
        break
      case TransactionType.TRANSFER:
        switch (blockchain.name.toLocaleLowerCase()) {
          case BLOCKCHAIN_BTC:
            result = new BitcoinPaymentLogsIterator(blockchain, this.bitcoinService, this.metaService)
            break
        }
        break
    }

    if (!result) {
      throw new Error(`Blockchain ${blockchain.name} is not supported`)
    }

    if (this.lastProcessed) {
      result.skip(this.lastProcessed)
    }

    return result
  }
}