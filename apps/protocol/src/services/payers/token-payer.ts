import { parseFixed } from '@ethersproject/bignumber'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { parseEther } from 'ethers'

import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'

import abiUniswapRouter from '../../abis/uniswap-router.json'

import { IERC20Metadata__factory, IERC20__factory, IJaneDoe__factory } from '../../../typechain-types'
import { ContractSettings } from '../../interfaces'
import { generatePaymentIdForEvm } from '../../utils'
import { UNISWAP_V2_ROUTER_ADDRESS, WETH_ADDRESS } from '../../constants'

export class TokenPayerBuilder {
  private static instance: TokenPayerBuilder | undefined = undefined

  public static getInstance(): TokenPayerBuilder {
    if (!TokenPayerBuilder.instance) {
      TokenPayerBuilder.instance = new TokenPayerBuilder()
    }
    return TokenPayerBuilder.instance
  }

  private contractSettings: ContractSettings | undefined
  private accountDao: AccountDao | undefined

  public withContractSettings(contractSettings: ContractSettings): TokenPayerBuilder {
    this.contractSettings = contractSettings
    return this
  }

  public withAccountDao(accountDao: AccountDao): EthPayerBuilder {
    this.accountDao = accountDao
    return this
  }

  public build(): TokenPayer {
    if (!this.contractSettings) {
      throw new Error(`Could not build TokenPayer since contractSettings is not set`)
    }
    if (!this.accountDao) {
      throw new Error(`Could not build TokenPayer since accountDao is not set`)
    }
    return new TokenPayer(this.contractSettings, this.accountDao)
  }
}

export class TokenPayer {
  public constructor(
    private contractSettings: ContractSettings,
    private accountDao: AccountDao
  ) { }

  public async pay(from: HardhatEthersSigner, to: HardhatEthersSigner, amount: number, erc20Address: string) {
    const contractJanedoe = IJaneDoe__factory.connect(this.contractSettings.contractAddresses.JaneDoe, from)
    const erc20 = IERC20__factory.connect(erc20Address, from)
    const erc20Metadata = IERC20Metadata__factory.connect(erc20Address, from)

    const symbol = await erc20Metadata.symbol()
    const decimals = await erc20Metadata.decimals()

    const value = parseFixed(amount.toString(), decimals).toString()

    console.log('1. reset approve')
    await erc20.approve(contractJanedoe.target, 0)

    console.log('2. approve')
    await erc20.approve(contractJanedoe.target, value)

    console.log(`3. pay ${amount} ${symbol}`)
    const paymentId = await generatePaymentIdForEvm(to.address, this.accountDao)
    await contractJanedoe.connect(from).payFrom(from.address, to.address, erc20.target, value, paymentId)
  }

  public async withdraw(account: HardhatEthersSigner, amount: number, erc20Address: string) {
    const contractJanedoe = IJaneDoe__factory.connect(this.contractSettings.contractAddresses.JaneDoe, account)
    const erc20Metadata = IERC20Metadata__factory.connect(erc20Address, account)

    const decimals = await erc20Metadata.decimals()
    const symbol = await erc20Metadata.symbol()

    const value = parseFixed(amount.toString(), decimals).toString()

    console.log(`Withdraw ${amount} ${symbol}`)
    await contractJanedoe.withdrawTo(account.address, erc20Address, value)
  }

  public async mint(account: HardhatEthersSigner, amountEth: number, erc20Address: string): Promise<void> {
    const path = [WETH_ADDRESS, erc20Address]
    const deadline = Math.floor(Date.now() / 1000) + 900
    const value = parseEther(amountEth.toString())

    const contractUniswapRouter = await ethers.getContractAt(abiUniswapRouter, UNISWAP_V2_ROUTER_ADDRESS, account)

    console.log(`Swap`)
    await contractUniswapRouter.swapExactETHForTokens(
      0,
      path,
      account.address,
      deadline,
      { value }
    )
  }
}
