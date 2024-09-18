import { AccountDao } from '@repo/dao/dist/src/dao/account.dao'
import { Account, AccountProfile } from '@repo/dao/dist/src/interfaces/account-profile'
import { SharedAccount } from '@repo/dao/dist/src/interfaces/shared-account'
import { IpnData, IpnKey, IpnResult } from '@repo/dao/dist/src/interfaces/ipn'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'
import { AccountApiSettings, AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountSettings, AccountTeamSettings } from '@repo/dao/dist/src/interfaces/account-settings'
import { PaymentFilter } from '@repo/dao/dist/src/interfaces/payment-filter'
import { AppSettings } from '@repo/dao/dist/src/interfaces/settings'
import { BitcoinService } from '@repo/bitcoin/dist/src/services/bitcoin.service'
import { ACCOUNT_ID_LENGTH } from '@repo/common/dist/src/constants'
import { BitcoinCoreError } from '@repo/bitcoin/dist/src/errors/bitcoin-core-error'

import { BLOCKCHAIN_BTC, COMMON_SETTINGS_DEFAULT_CURRENCY, COMMON_SETTINGS_MAX_DESCRIPTION_LENGTH } from '../constants'
import { logger } from '../utils/logger'
import { CryptoService } from './crypto-service'
import { IpnService } from './ipn-service'
import { PaymentHistory, PaymentHistoryResponse } from '../interfaces/payment-history'
import { PaymentLogService } from './payment-log-service'
import { convertPaymentLogToPaymentHistoryData, getAddressOrDefault, isNullOrEmptyOrWhitespaces, isValidUrl } from '../utils/utils'
import { ExchangeRateApiService } from './exchange-rate-api-service'
import { MetaService } from './meta-service'
import { PaymentLogKey } from '../interfaces/payment-log'
import { SettingsService } from './settings-service'
import { ServiceError } from '../errors/service-error'

export interface AccountService {
  loadAccount(id: string): Promise<Account | undefined>
  createAccount(address: string): Promise<Account>

  loadAccountProfile(id: string): Promise<AccountProfile | undefined>
  loadAccountProfileByAddress(address: string): Promise<AccountProfile | undefined>
  loadAccountProfileByApiKey(apiKey: string): Promise<AccountProfile | undefined>

  loadSharedAccount(shareToAddress: string, sharedAccountId: string): Promise<SharedAccount | undefined>
  listSharedAccounts(address: string): Promise<SharedAccount[]>

  loadDefaultAccountPaymentSettings(): Promise<AccountPaymentSettings>
  loadAccountSettings(id: string): Promise<AccountSettings | undefined>

  saveAccountPaymentSettings(id: string, paymentSettings: AccountPaymentSettings): Promise<void>
  saveAccountCommonSettings(id: string, commonSettings: AccountCommonSettings): Promise<void>
  saveAccountNotificationSettings(id: string, notificationSettings: AccountNotificationSettings): Promise<void>
  saveAccountTeamSettings(id: string, address: string, teamSettings: AccountTeamSettings): Promise<void>

  createAccountApiKeySettings(id: string): Promise<AccountApiSettings>
  removeAccountApiKeySettings(id: string): Promise<void>

  balance(id: string, blockchain: string): Promise<number>
  withdraw(id: string, blockchain: string, address: string): Promise<string | undefined>
  refund(id: string, blockchain: string, transaction: string, index: number, address: string, amount: string): Promise<string | undefined>
  loadIpn(ipnKey: IpnKey): Promise<IpnData | undefined>
  sendIpn(ipnKey: IpnKey): Promise<IpnResult>

  checkPaymentHistoryUpdates(id: string, from: number): Promise<number>
  loadPaymentHistory(id: string, filter: PaymentFilter, last: PaymentLogKey | undefined, size: number | undefined): Promise<PaymentHistoryResponse>
  loadPaymentHistoryDataAsCsv(id: string, filter: PaymentFilter): Promise<string[][]>
}

export class AccountServiceImpl implements AccountService {
  public constructor(
    private settingsService: SettingsService,
    private bitcoinService: BitcoinService,
    private cryptoService: CryptoService,
    private ipnService: IpnService,
    private paymentLogService: PaymentLogService,
    private exchangeRateApiService: ExchangeRateApiService,
    private metaService: MetaService,
    private accountDao: AccountDao
  ) { }

  public async checkPaymentHistoryUpdates(id: string, from: number): Promise<number> {
    const filteredPaymentLogs = await this.loadPaymentLogs(id, {
      timestampFrom: from + 1
    })

    return filteredPaymentLogs.length
  }

  public async loadPaymentHistory(id: string, filter: PaymentFilter, last: PaymentLogKey | undefined, size: number | undefined): Promise<PaymentHistoryResponse> {
    const filteredPaymentLogs = await this.loadPaymentLogs(id, filter)

    const lastIdx = last ?
      filteredPaymentLogs.findIndex(
        item => item.accountId === last.accountId
          && item.paymentId === last.paymentId
          && item.blockchain.toLocaleLowerCase() === last.blockchain.toLocaleLowerCase()
          && item.transaction === last.transaction
          && item.index === last.index
          && item.timestamp === last.timestamp
      )
      : -1
    if (last && lastIdx === -1) {
      logger.debug('AccountService: last not found among payments')
      return {
        data: [],
        totalSize: filteredPaymentLogs.length
      }
    }
    logger.debug(`AccountService: last payment index is ${lastIdx}`)

    const startIdx = lastIdx + 1
    const endIdx = size ? startIdx + size : undefined
    logger.debug(`AccountService: start to slice payment logs from ${startIdx} to ${endIdx} and convert to payment history`)
    const paymentHistory = await Promise.all(
      filteredPaymentLogs
        .slice(startIdx, endIdx)
        .map(paymentLog => this.convertPaymentLogToPaymentHistory(paymentLog))
    )
    logger.debug(`AccountService: ${paymentHistory.length} items after slicing and converting payment logs to payment history`)
    logger.debug(paymentHistory)

    return {
      data: paymentHistory,
      totalSize: filteredPaymentLogs.length
    }
  }

  public async loadPaymentHistoryDataAsCsv(id: string, filter: PaymentFilter): Promise<string[][]> {
    const headers = [
      'Payment Id',

      'Block',
      'Timestamp',
      'Transaction',
      'Index',

      'From',
      'To',
      'Amount',
      'Amount USD (Payment Time)',
      'Amount USD (Current Time)',
      'Amount Currency (Payment Time)',
      'Amount Currency (Current Time)',

      'Blockchain',
      'Token Address',
      'Token Symbol',
      'Token Decimals',
      'Token USD Price (Payment Time)',
      'Token USD Price (Current Time)',

      'Currency',
      'Currency Exchange Rate (Payment Time)',
      'Currency Exchange Rate (Current Time)',

      'Notification Result'
    ]

    const [settings, paymentLogs, meta] = await Promise.all([
      this.loadAccountSettings(id),
      this.loadPaymentLogs(id, filter),
      this.metaService.meta()
    ])

    const now = Math.floor(Date.now() / 1000)
    const timestamps = paymentLogs.map(item => item.timestamp)
    const currency = settings?.commonSettings.currency ?? COMMON_SETTINGS_DEFAULT_CURRENCY
    const currencyExchangeRates = await this.exchangeRateApiService.exchangeRates(currency, [...timestamps, now])

    const paymentHistoryData = await Promise.all(
      paymentLogs.map(async item => {
        const ipnResult = await this.ipnService.loadIpnResult({
          accountId: item.accountId,
          paymentId: item.paymentId,
          blockchain: item.blockchain,
          transaction: item.transaction,
          index: item.index
        })

        return convertPaymentLogToPaymentHistoryData(
          item,
          ipnResult,
          meta,
          currency,
          currencyExchangeRates[now],
          currencyExchangeRates
        )
      })
    )

    const data = paymentHistoryData.map(item => {
      return [
        item.paymentId, // 'Payment Id'

        item.block, // 'Block'
        item.timestamp.toString(), // 'Timestamp'
        item.transaction, // 'Transaction'
        item.index.toString(), // 'Index'

        item.from ?? '', // 'From'
        item.to, // 'To'
        item.amount, // 'Amount'
        item.amountUsdAtPaymentTime?.toString() ?? '', // 'Amount USD (Payment Time)'
        item.amountUsdAtCurTime?.toString() ?? '', // 'Amount USD (Current Time)'
        item.amountCurrencyAtPaymentTime?.toString() ?? '', // 'Amount Currency (Payment Time)'
        item.amountCurrencyAtCurTime?.toString() ?? '', // 'Amount Currency (Current Time)',

        item.blockchain, // 'Blockchain'
        item.tokenAddress ?? '', // 'Token Address'
        item.tokenSymbol ?? '', // 'Token Symbol'
        item.tokenDecimals?.toString() ?? '', // 'Token Decimals'
        item.tokenUsdPriceAtPaymentTime?.toString() ?? '', // 'Token USD Price (Payment Time)',
        item.tokenUsdPriceAtCurTime?.toString() ?? '', // 'Token USD Price (Current Time)',

        item.currency ?? '', // 'Currency'
        item.currencyExchangeRateAtPaymentTime?.toString() ?? '', // 'Currency Exchange Rate' (Payment Time)
        item.currencyExchangeRateAtCurTime?.toString() ?? '', // 'Currency Exchange Rate' (Current Time)

        item.ipnResult?.error ? 'error' : (item.ipnResult?.result ? 'success' : '') // 'Notification Result'
      ]
    })

    return [headers, ...data]
  }

  public async loadAccount(id: string): Promise<Account | undefined> {
    const account = await this.accountDao.loadAccount(id)
    if (account) {
      account.profile.secret = this.cryptoService.decrypt(account.profile.secret)
    }

    return account
  }

  public async loadAccountProfile(id: string): Promise<AccountProfile | undefined> {
    const profile = await this.accountDao.loadAccountProfile(id)
    if (profile) {
      profile.secret = this.cryptoService.decrypt(profile.secret)
    }

    return profile
  }

  public async loadAccountProfileByAddress(address: string): Promise<AccountProfile | undefined> {
    const profile = await this.accountDao.loadAccountProfileByAddress(address)
    if (profile) {
      profile.secret = this.cryptoService.decrypt(profile.secret)
    }

    return profile
  }

  public async createAccount(address: string): Promise<Account> {
    logger.debug(`AccountService: start to create account for ${address}`)

    const id = this.cryptoService.generateRandom(ACCOUNT_ID_LENGTH)
    const secret = this.cryptoService.generateRandom()
    const encryptedSecret = this.cryptoService.encrypt(secret)

    const paymentSettings = await this.loadDefaultAccountPaymentSettings()

    const account: Account = {
      profile: {
        id, address, secret: encryptedSecret
      },
      settings: {
        paymentSettings,
        commonSettings: {
          email: null,
          description: null,
          currency: COMMON_SETTINGS_DEFAULT_CURRENCY
        },
        notificationSettings: {
          callbackUrl: null,
          secretKey: null
        },
        apiSettings: {
          apiKey: null
        },
        teamSettings: {
          users: []
        },
      }
    }

    await this.accountDao.saveAccount(account)
    await this.bitcoinService.createWallet(id)

    logger.debug('AccountService: end to create account')
    logger.debug(account)

    account.profile.secret = secret
    return account
  }

  public async listSharedAccounts(address: string): Promise<SharedAccount[]> {
    logger.debug(`AccountService: start to list shared accounts for ${address}`)
    const sharedAccounts = await this.accountDao.listSharedAccounts(address)
    logger.debug('AccountService: end to list shared accounts')
    logger.debug(sharedAccounts)

    return sharedAccounts
  }

  public async loadSharedAccount(shareToAddress: string, sharedAccountId: string): Promise<SharedAccount | undefined> {
    logger.debug(`AccountService: start to load shared account for share to address ${shareToAddress} and shared account id ${sharedAccountId}`)
    const sharedAccount = await this.accountDao.loadSharedAccount(shareToAddress, sharedAccountId)
    logger.debug('AccountService: end to load shared account')
    logger.debug(sharedAccount)

    return sharedAccount
  }

  public async loadDefaultAccountPaymentSettings(): Promise<AccountPaymentSettings> {
    return await this.settingsService.loadDefaultAccountPaymentSettings()
  }

  public async loadAccountSettings(id: string): Promise<AccountSettings | undefined> {
    const settings = await this.accountDao.loadAccountSettings(id)

    return settings
      ? {
        ...settings,
        notificationSettings: {
          ...settings.notificationSettings,
          secretKey: settings.notificationSettings.secretKey ? this.cryptoService.decrypt(settings.notificationSettings.secretKey) : ''
        },
        apiSettings: {
          ...settings.apiSettings,
          apiKey: settings.apiSettings.apiKey ? this.cryptoService.decrypt(settings.apiSettings.apiKey) : ''
        }
      }
      : undefined
  }

  public async saveAccountPaymentSettings(id: string, paymentSettings: AccountPaymentSettings): Promise<void> {
    this.assertPaymentSettings(paymentSettings)

    await this.accountDao.saveAccountPaymentSettings(id, paymentSettings)
  }

  public async saveAccountCommonSettings(id: string, commonSettings: AccountCommonSettings): Promise<void> {
    const appSettings = await this.settingsService.loadAppSettings()
    this.assertCommonSettings(commonSettings, appSettings)

    await this.accountDao.saveAccountCommonSettings(id, commonSettings)
  }

  public async saveAccountNotificationSettings(id: string, notificationSettings: AccountNotificationSettings): Promise<void> {
    this.assertNotificationSettings(notificationSettings)

    if (notificationSettings.secretKey) {
      notificationSettings.secretKey = this.cryptoService.encrypt(notificationSettings.secretKey)
    }

    await this.accountDao.saveAccountNotificationSettings(id, notificationSettings)
  }

  public async saveAccountTeamSettings(id: string, address: string, teamSettings: AccountTeamSettings): Promise<void> {
    this.assertAccountTeamSettings(teamSettings, address)

    await this.accountDao.saveAccountTeamSettings(id, address, teamSettings)
  }

  public async loadAccountProfileByApiKey(apiKey: string): Promise<AccountProfile | undefined> {
    const encryptedApiKey = this.cryptoService.encrypt(apiKey)

    logger.debug(`AccountService: start to load account profile by api key ${encryptedApiKey}`)
    const profile = await this.accountDao.loadAccountProfileByApiKey(encryptedApiKey)
    logger.debug('AccountService: end to load account profile by api key')
    logger.debug(profile)

    if (profile) {
      profile.secret = this.cryptoService.decrypt(profile.secret)
    }

    return profile
  }

  public async createAccountApiKeySettings(id: string): Promise<AccountApiSettings> {
    const apiKey = this.cryptoService.generateRandom()
    const apiKeyEncrypted = this.cryptoService.encrypt(apiKey)

    await this.accountDao.saveAccountApiKeySettings(id, { apiKey: apiKeyEncrypted })

    return { apiKey }
  }

  public async removeAccountApiKeySettings(id: string): Promise<void> {
    await this.accountDao.deleteAccountApiKeySettings(id)
  }

  public async balance(id: string, blockchain: string): Promise<number> {
    switch (blockchain.toLocaleLowerCase()) {
      case BLOCKCHAIN_BTC:
        return await this.bitcoinService.getWalletBalance(id)
      default:
        throw new Error(`Unsupported blockchain ${blockchain}`)
    }
  }

  public async withdraw(id: string, blockchain: string, address: string): Promise<string | undefined> {
    switch (blockchain.toLocaleLowerCase()) {
      case BLOCKCHAIN_BTC:
        const settings = await this.loadAccountSettings(id)
        if (!settings) {
          logger.error(`AccountService: account payment settings not found for ${id}`)
          throw new Error(`Account payment settings not found for ${id}`)
        }

        const wallet = settings.paymentSettings.blockchains.find(item => item.toLocaleLowerCase() === blockchain.toLocaleLowerCase())
        if (!wallet) {
          logger.error(`AccountService: wallet not found for ${blockchain}`)
          throw new Error(`Wallet not found for ${blockchain}`)
        }

        try {
          return await this.bitcoinService.withdraw(id, address)
        } catch (err) {
          if (err instanceof BitcoinCoreError) {
            const bitcoinCoreError = err as BitcoinCoreError
            logger.warn(`AccountService: bitcoin core error happens with code ${bitcoinCoreError.code} and name ${bitcoinCoreError.name} and message ${bitcoinCoreError.message}`)
            this.processBitcoinError(bitcoinCoreError)
          }

          throw err
        }
      default:
        logger.error(`AccountService: unsupported blockchain ${blockchain}`)
        throw new Error(`Unsupported blockchain ${blockchain}`)
    }
  }

  public async refund(id: string, blockchain: string, transaction: string, index: number, address: string, amount: string): Promise<string | undefined> {
    switch (blockchain.toLocaleLowerCase()) {
      case BLOCKCHAIN_BTC:
        try {
          return await this.bitcoinService.refund(
            id,
            {
              txid: transaction,
              vout: index
            },
            address,
            amount
          )
        } catch (err) {
          if (err instanceof BitcoinCoreError) {
            const bitcoinCoreError = err as BitcoinCoreError
            logger.warn(`AccountService: bitcoin core error happens with code ${bitcoinCoreError.code} and name ${bitcoinCoreError.name} and message ${bitcoinCoreError.message}`)
            this.processBitcoinError(bitcoinCoreError)
          }

          throw err
        }
      default:
        logger.error(`AccountService: unsupported blockchain ${blockchain}`)
        throw new Error(`Unsupported blockchain ${blockchain}`)
    }
  }

  public async loadIpn(ipnKey: IpnKey): Promise<IpnData | undefined> {
    logger.debug('IpnNotificationObserver: start to load ipn')
    const ipn = await this.ipnService.loadIpnData(ipnKey)
    logger.debug('IpnNotificationObserver: end to load ipn')
    logger.debug(ipn)

    return ipn
  }

  public async sendIpn(ipnKey: IpnKey): Promise<IpnResult> {
    logger.debug(`IpnNotificationObserver: start to load notification settings for account id ${ipnKey.accountId}`)
    const settings = await this.loadAccountSettings(ipnKey.accountId)
    logger.debug('IpnNotificationObserver: end to load notification settings')
    if (!settings || !settings.notificationSettings.callbackUrl) {
      logger.error('IpnNotificationObserver: notification settings not found or callback url is not set')
      throw new Error('Notification settings not found or callback url is not set')
    }
    logger.debug(settings)

    logger.debug('IpnNotificationObserver: start to load ipn')
    const ipn = await this.ipnService.loadIpnData(ipnKey)
    logger.debug('IpnNotificationObserver: end to load ipn')
    if (!ipn) {
      logger.error('IpnNotificationObserver: ipn not found')
      throw new Error('IPN not found')
    }
    logger.debug(ipn)

    logger.debug('IpnNotificationObserver: start to send ipn')
    const result = await this.ipnService.trySendIpnRequest(settings.notificationSettings.callbackUrl, ipn, settings.notificationSettings.secretKey)
    logger.debug('IpnNotificationObserver: end to send ipn')
    logger.debug(result)

    return result
  }

  public async loadPaymentLogs(id: string, filter: PaymentFilter): Promise<PaymentLog[]> {
    logger.debug(`AccountService: start to list payment logs for id ${id} from ${filter.timestampFrom} to ${filter.timestampTo}`)
    let paymentLogs = await this.paymentLogService.listPaymentLogs(id, filter)
    logger.debug(`AccountService: found ${paymentLogs.length} payment logs`)
    logger.debug(paymentLogs)

    return paymentLogs
  }

  private async convertPaymentLogToPaymentHistory(paymentLog: PaymentLog): Promise<PaymentHistory> {
    const ipnResult = await this.ipnService.loadIpnResult({
      accountId: paymentLog.accountId,
      paymentId: paymentLog.paymentId,
      blockchain: paymentLog.blockchain,
      transaction: paymentLog.transaction,
      index: paymentLog.index
    })

    const res: PaymentHistory = {
      id: paymentLog.accountId,
      paymentId: paymentLog.paymentId,

      block: paymentLog.block,
      timestamp: paymentLog.timestamp,
      transaction: paymentLog.transaction,
      index: paymentLog.index,

      from: paymentLog.from,
      to: paymentLog.to,
      amount: paymentLog.amount,
      amountUsd: paymentLog.amountUsd,

      blockchain: paymentLog.blockchain,
      tokenAddress: paymentLog.tokenAddress,
      tokenSymbol: paymentLog.tokenSymbol,
      tokenDecimals: paymentLog.tokenDecimals,
      tokenUsdPrice: paymentLog.tokenUsdPrice,

      ipnResult: ipnResult ?? null
    }

    return res
  }

  private assertPaymentSettings(settings: AccountPaymentSettings): void {
    const errors: string[] = []

    if (settings.blockchains.length === 0) {
      errors.push('Blockchains is not provided')
    }

    if (settings.assets.length === 0) {
      errors.push('Assets is not provided')
    }

    const invalidBlockchains = settings.blockchains.find(isNullOrEmptyOrWhitespaces)
    if (invalidBlockchains) {
      errors.push('Some of blockchains value is empty')
    }

    const invalidAssets = settings.assets.find(
      asset => isNullOrEmptyOrWhitespaces(asset.blockchain) || isNullOrEmptyOrWhitespaces(asset.symbol)
    )
    if (invalidAssets) {
      errors.push('Blockchain or symbol is not provided for some of assets')
    }

    const duplicateBlockchains = settings.blockchains
      .filter((blockchain, index, self) => self.indexOf(blockchain) !== index)
    if (duplicateBlockchains.length > 0) {
      errors.push(`Duplicate addresses found ${duplicateBlockchains.join(', ')}`)
    }

    if (errors.length > 0) {
      throw new Error(`Payment settings validation errors: ${errors.join(', ')}`)
    }
  }

  private assertCommonSettings(settings: AccountCommonSettings, appSettings: AppSettings): void {
    const errors: string[] = []

    if (settings.email && !/^[^\s@]+@[^\s@]+$/.test(settings.email)) {
      errors.push('Email is not valid')
    }

    if (settings.description && settings.description.length > COMMON_SETTINGS_MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description length should not be more than ${COMMON_SETTINGS_MAX_DESCRIPTION_LENGTH}`)
    }

    if (settings.currency && appSettings.currencies.findIndex(item => item.symbol.toLocaleLowerCase() === settings.currency?.toLocaleLowerCase()) === -1) {
      errors.push(`Currency ${settings.currency} is not supported`)
    }

    if (errors.length > 0) {
      throw new Error(`Team settings validation errors: ${errors.join(', ')}`)
    }
  }

  private assertNotificationSettings(settings: AccountNotificationSettings): void {
    const errors: string[] = []

    if (settings.callbackUrl && !isValidUrl(settings.callbackUrl)) {
      errors.push('Callback URL is not valid')
    }

    if (errors.length > 0) {
      throw new Error(`Team settings validation errors: ${errors.join(', ')}`)
    }
  }

  private assertAccountTeamSettings(settings: AccountTeamSettings, ownerAddress: string): void {
    const errors: string[] = []

    const emptyAddress = settings.users.findIndex(user => isNullOrEmptyOrWhitespaces(user.address)) !== -1
    if (emptyAddress) {
      errors.push('Address is not provided for some of users')
    }

    const isOwnerAddress = settings?.users.findIndex(user => user.address.toLocaleLowerCase() === ownerAddress?.toLocaleLowerCase()) !== -1
    if (isOwnerAddress) {
      errors.push('Owner address should not be used')
    }

    const duplicateAddresses = settings.users
      .map(user => user.address.toLocaleLowerCase())
      .filter((address, index, self) => self.indexOf(address.toLocaleLowerCase()) !== index)
    if (duplicateAddresses.length > 0) {
      errors.push(`Duplicate addresses found ${duplicateAddresses.join(', ')}`)
    }

    const invalidAddresses = settings.users
      .map(user => user.address)
      .filter(address => !getAddressOrDefault(address))
    if (invalidAddresses.length > 0) {
      errors.push(`Invalid addresses found ${invalidAddresses.join(', ')}`)
    }

    settings?.users.forEach(
      user => Object.entries(user.permissions).forEach(item => {
        if (item[0] === 'balances' && !['Disable', 'View'].includes(item[1])) {
          errors.push(`Invalid permission value ${item[0]} = ${item[1]} found for address ${user.address}`)
        }
      })
    )

    if (errors.length > 0) {
      throw new Error(`Team settings validation errors: ${errors.join(', ')}`)
    }
  }

  private processBitcoinError(bitcoinCoreError: BitcoinCoreError): void {
    switch (bitcoinCoreError.code) {
      // RPC_INVALID_REQUEST is internally mapped to HTTP_BAD_REQUEST (400).
      // It should not be used for application-layer errors.
      case -32600:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // RPC_METHOD_NOT_FOUND is internally mapped to HTTP_NOT_FOUND (404).
      // It should not be used for application-layer errors.
      case -32601:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      case -32602:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // RPC_INTERNAL_ERROR should only be used for genuine errors in bitcoind
      // (for example datadir corruption).
      case -32603:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      case -32700:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')

      //! General application defined errors

      // std::exception thrown in command handling
      case -1:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.command_handling_error')
      // Unexpected type was passed as parameter
      case -3:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.unexpected_parameter')
      // Invalid address or key
      case -5:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.invalid_address_or_key')
      // Ran out of memory during operation
      case -7:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Invalid, missing or duplicate parameter
      case -8:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.missing_or_duplicate_parameter')

      // Database error
      case -20:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Error parsing or validating structure in raw format
      case -22:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.parsing_or_validation_raw_format_error')
      // General error during transaction or block submission
      case -25:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.transaction_or_block_submission_error')
      // Transaction or block was rejected by network rules
      case -26:
        if (bitcoinCoreError.message.trim().toLocaleLowerCase() === 'dust') {
          // transaction you are attempting to send includes an output that is considered "dust." In the context of Bitcoin, "dust" refers to a very small amount of cryptocurrency that is less than the network fee required to send it, rendering it economically unfeasible to spend.
          throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.transaction_rejected_dust_error')
        } else {
          throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.transaction_or_block_rejected_error')
        }

      // Transaction already in chain
      case -27:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.transaction_already_in_chain_error')
      // Client still warming up
      case -28:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // RPC method is deprecated
      case -32:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')

      //! P2P client errors

      // Bitcoin is not connected
      case -9:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Still downloading initial blocks
      case -10:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Node is already added
      case -23:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Node has not been added before
      case -24:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Node to disconnect not found in connected nodes
      case -29:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Invalid IP/Subnet
      case -30:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // No valid connection manager instance found
      case -31:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Max number of outbound or block-relay connections already open
      case -34:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')

      //! Chain errors

      // No mempool instance found
      case -33:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')

      //! Wallet errors

      // Unspecified problem with wallet (key not found etc.)
      case -4:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.unspecified_wallet_error')
      // Not enough funds in wallet or account
      case -6:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.not_enough_funds_error')
      // Invalid label name
      case -11:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.invalid_label_error')
      // Keypool ran out, call keypoolrefill first
      case -12:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
      // Enter the wallet passphrase with walletpassphrase first
      case -13:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.wallet_passphrase_error')
      // The wallet passphrase entered was incorrect
      case -14:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.invalid_wallet_passphrase_error')
      // Command given in wrong wallet encryption state (encrypting an encrypted wallet etc.)
      case -15:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.invalid_command_encryption_error')
      // Failed to encrypt the wallet
      case -16:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.encrypt_wallet_error')
      // Wallet is already unlocked
      case -17:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.wallet_already_unlocked_error')
      // Invalid wallet specified
      case -18:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.invalid_wallet_specified_error')
      // No wallet specified (error when there are multiple wallets loaded)
      case -19:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.no_wallet_specified_error')
      // This same wallet is already loaded
      case -35:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.wallet_already_loaded_error')
      // There is already a wallet with the same name
      case -36:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.wallet_already_exist_error')

      //! Unused reserved codes, kept around for backwards compatibility. Do not reuse.

      // Server is in safe mode, and command is not allowed in safe mode
      case -2:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')

      default:
        throw new ServiceError(bitcoinCoreError.message, 'services.errors.bitcoin_errors.internal_server_error')
    }
  }
}
