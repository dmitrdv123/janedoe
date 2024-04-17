import { parseFixed } from '@ethersproject/bignumber'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'

import { ETH_DECIMALS } from '../../constants'
import { JaneDoe__factory, WrappedNative__factory } from '../../../typechain-types'
import { ContractSettings } from '../../interfaces'
import { generatePaymentIdForEvm } from '../../utils'

export class EthPayerBuilder {
  private static instance: EthPayerBuilder | undefined = undefined

  public static getInstance(): EthPayerBuilder {
    if (!EthPayerBuilder.instance) {
      EthPayerBuilder.instance = new EthPayerBuilder()
    }
    return EthPayerBuilder.instance
  }

  private contractSettings: ContractSettings | undefined
  private accountDao: AccountDao | undefined

  public withContractSettings(contractSettings: ContractSettings): EthPayerBuilder {
    this.contractSettings = contractSettings
    return this
  }

  public withAccountDao(accountDao: AccountDao): EthPayerBuilder {
    this.accountDao = accountDao
    return this
  }

  public build(): EthPayer {
    if (!this.contractSettings) {
      throw new Error(`Could not build EthPayer since contractSettings is not set`)
    }
    if (!this.accountDao) {
      throw new Error(`Could not build EthPayer since accountDao is not set`)
    }
    return new EthPayer(this.contractSettings, this.accountDao)
  }
}

export class EthPayer {
  public constructor(
    private contractSettings: ContractSettings,
    private accountDao: AccountDao
  ) { }

  public async pay(from: HardhatEthersSigner, to: HardhatEthersSigner, amount: number) {
    const value = parseFixed(amount.toString(), ETH_DECIMALS).toString()

    const contractWrappedNative = WrappedNative__factory.connect(this.contractSettings.contractAddresses.WrappedNative, from)
    const contractJanedoe = JaneDoe__factory.connect(this.contractSettings.contractAddresses.JaneDoe, from)

    console.log('1. Approve')
    await contractWrappedNative.approve(this.contractSettings.contractAddresses.JaneDoe, value)

    console.log(`2. Pay ${amount} ETH`)
    const paymentId = await generatePaymentIdForEvm(to.address, this.accountDao)
    await contractJanedoe.payNativeFrom(from.address, to.address, paymentId, { value })
  }

  public async payManually(from: HardhatEthersSigner, to: HardhatEthersSigner, amount: number) {
    const value = parseFixed(amount.toString(), ETH_DECIMALS).toString()

    const contractWrappedNative = WrappedNative__factory.connect(this.contractSettings.contractAddresses.WrappedNative, from)
    const contractJanedoe = JaneDoe__factory.connect(this.contractSettings.contractAddresses.JaneDoe, from)

    console.log('1. Wrap')
    await contractWrappedNative.connect(from).wrapTo(from.address, { value })

    console.log('2. Approve')
    await contractWrappedNative.connect(from).approve(contractJanedoe.target, value)

    console.log('3. Pay')
    const paymentId = await generatePaymentIdForEvm(to.address, this.accountDao)
    await contractJanedoe.connect(from).payFrom(from.address, to.address, contractWrappedNative.target, value, paymentId)

    console.log('4. Withdraw')
    await contractJanedoe.connect(to).withdrawTo(to.address, contractWrappedNative.target, value)

    console.log('5. Unwrap')
    await contractWrappedNative.connect(to).unwrapTo(to.address, value)
  }

  public async withdraw(account: HardhatEthersSigner, amount: number) {
    const value = parseFixed(amount.toString(), ETH_DECIMALS).toString()
    const contractJanedoe = JaneDoe__factory.connect(this.contractSettings.contractAddresses.JaneDoe, account)

    console.log(`Withdraw ${amount} ETH`)
    await contractJanedoe.withdrawEthTo(account.address, value)
  }
}
