import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { customAlphabet } from 'nanoid'
import { AxiosError } from 'axios'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import { BitcoinService } from '@repo/common/dist/src/services/bitcoin-service'
import { BitcoinWrapperService } from '@repo/common/dist/src/services/bitcoin-wrapper-service'
import { commonContainer } from '@repo/common/dist/src/containers/common.container'
import appConfig from '@repo/common/dist/src/app-config'

export class BtcPayerBuilder {
  private static instance: BtcPayerBuilder | undefined = undefined

  public static getInstance(): BtcPayerBuilder {
    if (!BtcPayerBuilder.instance) {
      BtcPayerBuilder.instance = new BtcPayerBuilder()
    }
    return BtcPayerBuilder.instance
  }

  private accountDao: AccountDao | undefined

  public withAccountDao(accountDao: AccountDao): BtcPayerBuilder {
    this.accountDao = accountDao
    return this
  }

  public build(): BtcPayer {
    if (!this.accountDao) {
      throw new Error(`Could not build BtcPayer since accountDao is not set`)
    }
    return new BtcPayer(this.accountDao)
  }
}

export class BtcPayer {
  public constructor(
    private accountDao: AccountDao
  ) { }


  public async pay(from: string, to: HardhatEthersSigner, amount: number) {
    const accountProfile = await this.accountDao.loadAccountProfileByAddress(to.address)
    if (!accountProfile) {
      throw new Error(`Btc payment failed. Account profile for address ${to.address} not found`)
    }

    const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz')
    const paymentId = nanoid()
    const protocolPaymentId = accountProfile.id + paymentId

    const bitcoinService = commonContainer.resolve<BitcoinService>('bitcoinService')
    const bitcoinWrapperService = commonContainer.resolve<BitcoinWrapperService>('bitcoinWrapperService')

    let addressTo: string = ''
    try {
      console.log(`BtcPayer: start to create bitcoin address for account id ${accountProfile.id} and address ${accountProfile.address} with label ${protocolPaymentId}`)
      addressTo = await bitcoinService.createBitcoinAddress(accountProfile.id, protocolPaymentId)
      console.log(`BtcPayer: end to create bitcoin address for wallet ${accountProfile.id} with label ${protocolPaymentId}`)

      console.log(`BtcPayer: start to import bitcoin address ${addressTo} into wallet ${appConfig.BITCOIN_CENTRAL_WALLET} with label ${protocolPaymentId}`)
      await bitcoinService.importBitcoinAddress(appConfig.BITCOIN_CENTRAL_WALLET, addressTo, protocolPaymentId)
      console.log(`BtcPayer: end to import bitcoin address ${addressTo} into wallet ${appConfig.BITCOIN_CENTRAL_WALLET} with label ${protocolPaymentId}`)
    } catch (error) {
      if (error instanceof AxiosError) {
        const dataError = error.response?.data?.error
          ? error.response.data.error
          : undefined

        if (dataError) {
          throw new Error(JSON.stringify(dataError))
        }
      }

      throw error
    }

    try {
      console.log(`BtcPayer: start to load bitcoin wallet ${from}`)
      await bitcoinWrapperService.loadBitcoinWallet(from)
      console.log(`BtcPayer: end to load bitcoin wallet ${from}`)

      console.log(`BtcPayer: start to send ${amount} bitcoins from ${from} to ${addressTo}`)
      await bitcoinWrapperService.sendBitcoinTo(from, addressTo, amount)
      console.log(`BtcPayer: end to send ${amount} bitcoins from ${from} to ${addressTo}`)
    } finally {
      await bitcoinWrapperService.unloadBitcoinWallet(from)
    }
  }
}
