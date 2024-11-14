import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { customAlphabet } from 'nanoid'
import { AxiosError } from 'axios'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import { BitcoinService } from '@repo/bitcoin/dist/src/services/bitcoin.service'
import { bitcoinContainer } from '@repo/bitcoin/dist/src/containers/bitcoin.container'
import { createProtocolPaymentId } from '@repo/common/dist/src/utils/utils'

import { BitcoinWrapperServiceImpl } from '../bitcoin-wrapper.service'

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
    const protocolPaymentId = createProtocolPaymentId(accountProfile.id, paymentId)

    const bitcoinService = bitcoinContainer.resolve<BitcoinService>('bitcoinService')

    let addressTo: string | undefined = undefined
    try {
      console.log(`BtcPayer: start to create bitcoin wallet for account id ${accountProfile.id}`)
      const wallet = await bitcoinService.createWallet(accountProfile.id)
      console.log(`BtcPayer: end to create bitcoin wallet for account id ${accountProfile.id}: ${JSON.stringify(wallet)}`)

      console.log(`BtcPayer: start to create bitcoin wallet address for account id ${accountProfile.id} with label ${protocolPaymentId}`)
      const walletAddress = await bitcoinService.createWalletAddress(accountProfile.id, paymentId)
      console.log(`BtcPayer: end to create bitcoin wallet address for account id ${accountProfile.id} with label ${protocolPaymentId}: ${JSON.stringify(walletAddress)}`)

      addressTo = walletAddress.data.address
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

    const bitcoinWrapperService = new BitcoinWrapperServiceImpl()

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
