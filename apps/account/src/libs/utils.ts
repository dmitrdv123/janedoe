import { CoreHelperUtil } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { Asset, BlockchainMeta, Token } from 'rango-sdk-basic'
import { Address, Transport, fallback, formatUnits, getAddress, http, isAddress } from 'viem'

import { AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountRbacSettings, AccountTeamSettings, Permission, PermissionKey } from '../types/account-settings'
import { PaymentHistory, PaymentHistoryData } from '../types/payment-history'
import { ServiceError } from '../types/service-error'
import { PERMISSION_PRIORITY, PUBLIC_NODE_RPCS } from '../constants'

export function authDataKey(): string {
  return `${import.meta.env.VITE_APP_APP_PREFIX ?? 'janedoe'}:authData`
}

export function convertErrorToMessage(error: any, defaultMessage: string, curDepth: number = 1, maxDepth: number = 10): string {
  if ('string' === typeof error) {
    return error
  }

  if (error.message) {
    return error.message
  }

  if (error.errors) {
    const result: string[] = error.errors.map((item: any) => convertErrorToMessage(item, defaultMessage))
    return result.join('\n')
  }

  if (error.error && curDepth < maxDepth) {
    return convertErrorToMessage(error.error, defaultMessage, ++curDepth)
  }

  return defaultMessage
}

export function convertWagmiTransactionErrorToMessage(error: Error, defaultMessage: string, curDepth: number = 1, maxDepth: number = 10): string {
  return convertErrorToMessage(error, defaultMessage, ++curDepth, maxDepth)
}

export function tryParseInt(val: string | null | undefined): number | undefined {
  if (isNullOrEmptyOrWhitespaces(val)) {
    return undefined
  }

  try {
    return parseInt(val as string)
  } catch {
    return undefined
  }
}

export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
}

export function stringComparator(a: string, b: string) {
  if (!a || !b) {
    return -1
  }

  return a.toLocaleLowerCase() > b.toLocaleLowerCase() ? 1 : -1
}

export function findBlockchainByName(blockchains: BlockchainMeta[], name: string): BlockchainMeta | undefined {
  return blockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === name.toLocaleLowerCase())
}

export function cutString(str: string, num: number = 4, max: number = 11): string {
  if (str.length <= max || str.length <= 2 * num) {
    return str
  }

  return str.substring(0, num) + '...' + str.substring(str.length - num, str.length)
}

export function isBlockchainToken(blockchain: BlockchainMeta, token: Token): boolean {
  return token.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
}

export function isBlockchainAsset(blockchain: BlockchainMeta, asset: Asset): boolean {
  return asset.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
}

export function tokenDefaultResultComparator(a: Token, b: Token): number {
  if (a.blockchain > b.blockchain) {
    return 1
  }
  if (a.blockchain < b.blockchain) {
    return -1
  }

  if (a.address && !b.address) {
    return 1
  }

  if (!a.address && b.address) {
    return -1
  }

  return stringComparator(a.symbol as string, b.symbol as string)
}

export function sameToken(a: Token, b: Token): boolean {
  return a.blockchain.toLocaleLowerCase() === b.blockchain.toLocaleLowerCase()
    && a.symbol.toLocaleLowerCase() === b.symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(a.address) && isNullOrEmptyOrWhitespaces(b.address)) || a.address?.toLocaleLowerCase() === b.address?.toLocaleLowerCase()
    )
}

export function sameTokenAndAsset(a: Asset, b: Token): boolean {
  return a.blockchain.toLocaleLowerCase() === b.blockchain.toLocaleLowerCase()
    && a.symbol.toLocaleLowerCase() === b.symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(a.address) && isNullOrEmptyOrWhitespaces(b.address)) || a.address?.toLocaleLowerCase() === b.address?.toLocaleLowerCase()
    )
}

export function sameAsset(a: Asset, b: Asset): boolean {
  return a.blockchain.toLocaleLowerCase() === b.blockchain.toLocaleLowerCase()
    && a.symbol.toLocaleLowerCase() === b.symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(a.address) && isNullOrEmptyOrWhitespaces(b.address)) || a.address?.toLocaleLowerCase() === b.address?.toLocaleLowerCase()
    )
}

export function findToken(tokens: Token[], blockchain: string, symbol: string, address: string | null): Token | undefined {
  return tokens.find(token => isToken(token, blockchain, symbol, address))
}

export function isToken(token: Token, blockchain: string, symbol: string, address: string | null): boolean {
  return token.blockchain.toLocaleLowerCase() === blockchain.toLocaleLowerCase()
    && token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(token.address) && isNullOrEmptyOrWhitespaces(address)) || token.address?.toLocaleLowerCase() === address?.toLocaleLowerCase()
    )
}

export function tokenToUniqueStr(token: Token): string {
  return `${token.blockchain.toLocaleLowerCase()}_${token.symbol.toLocaleLowerCase()}_${token.address ?? 'null'}`
}

export function findNativeToken(blockchain: BlockchainMeta, tokens: Token[]): Token | undefined {
  for (const feeAsset of blockchain.feeAssets) {
    const token = findToken(tokens, blockchain.name, feeAsset.symbol, feeAsset.address)
    if (token !== undefined) {
      return token
    }
  }

  return undefined
}

export function assertAccountPaymentSettings(settingsToUpdate: AccountPaymentSettings | undefined): string[] {
  const errors: string[] = []

  if (!settingsToUpdate) {
    errors.push('Payment settings are empty')
  }

  if (settingsToUpdate?.blockchains.length === 0) {
    errors.push('Blockchains are not set')
  }

  settingsToUpdate?.blockchains.forEach(blockchain => {
    const idx = settingsToUpdate.assets.findIndex(asset => asset.blockchain.toLocaleLowerCase() === blockchain.toLocaleLowerCase())
    if (idx === -1) {
      errors.push(`Blockchain ${blockchain} does not have tokens`)
    }
  })

  return errors
}

export function assertAccountCommonSettings(settings: AccountCommonSettings | undefined): string[] {
  const errors: string[] = []

  if (settings?.email && !/^[^\s@]+@[^\s@]+$/.test(settings.email)) {
    errors.push('Email is not valid')
  }

  return errors
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function assertAccountNotificationSettings(settings: AccountNotificationSettings | undefined): string[] {
  const errors: string[] = []

  if (settings?.callbackUrl && !isValidUrl(settings.callbackUrl)) {
    errors.push('Callback URL is not valid')
  }

  return errors
}

export function assertAddress(address: string, ownerAddress: string | undefined, addresses: string[]): string[] {
  const errors: string[] = []

  if (isNullOrEmptyOrWhitespaces(address)) {
    errors.push('Address is not provided')
  } else {
    if (!getAddressOrDefault(address)) {
      errors.push('Invalid address format')
    }

    if (address.toLocaleLowerCase() === ownerAddress?.toLocaleLowerCase()) {
      errors.push(`Account owner address should not be used`)
    }

    const duplicates = addresses.filter(addr => addr.toLocaleLowerCase() === address.toLocaleLowerCase())
    if (duplicates && duplicates.length > 1) {
      errors.push('Duplicate address')
    }
  }

  return errors
}

export function assertAccountTeamSettings(settings: AccountTeamSettings | undefined, ownerAddress: string | undefined): string[] {
  const errors: string[] = []

  const emptyAddress = settings?.users.findIndex(user => isNullOrEmptyOrWhitespaces(user.address)) !== -1
  if (emptyAddress) {
    errors.push('Address is not provided for some of users')
  }

  const isOwnerAddress = settings?.users.findIndex(user => user.address.toLocaleLowerCase() === ownerAddress?.toLocaleLowerCase()) !== -1
  if (isOwnerAddress) {
    errors.push('Owner address should not be used')
  }

  const duplicateAddresses = settings?.users
    .map(user => user.address)
    .filter((address, index, self) => self.indexOf(address) !== index)
  if (duplicateAddresses && duplicateAddresses.length > 0) {
    errors.push(`Duplicate addresses found ${duplicateAddresses.join(', ')}`)
  }

  const invalidAddresses = settings?.users
    .map(user => user.address)
    .filter(address => !getAddressOrDefault(address))
  if (invalidAddresses && invalidAddresses.length > 0) {
    errors.push(`Invalid addresses found ${invalidAddresses.join(', ')}`)
  }

  settings?.users.forEach(
    user => Object.entries(user.permissions).forEach(item => {
      if (item[0] === 'balances' && !['Disable', 'View'].includes(item[1])) {
        errors.push(`Invalid permission value ${item[0]} = ${item[1]} found for address ${user.address}`)
      }
    })
  )

  return errors
}

export function getAddressOrDefault(value: string | null | undefined, defaultValue: Address | undefined = undefined): Address | undefined {
  try {
    return !!value && isAddress(value) ? getAddress(value) : defaultValue
  } catch {
    return defaultValue
  }
}

export function formatToFixed(balance: string, decimals: number, decimalPlaces?: number) {
  const bal = BigInt(balance)
  if (decimalPlaces !== undefined && decimals > decimalPlaces) {
    const remainder = bal % BigInt(10 ** (decimals - decimalPlaces))
    return formatUnits(bal - remainder, decimals)
  } else {
    return formatUnits(bal, decimals)
  }
}

export function tokenAmountToUsd(amount: string, usdPrice: number, decimals: number): number {
  return usdPrice * convertBigIntToFloat(BigInt(amount), decimals)
}

export function tokenAmountToCurrency(amount: string, usdPrice: number, decimals: number, exchangeRate: number): number {
  return exchangeRate * tokenAmountToUsd(amount, usdPrice, decimals)
}

export function convertBigIntToFloat(value: bigint, decimals: number): number {
  return parseFloat(formatUnits(value, decimals))
}

export function convertStringToTimestamp(value: string | null | undefined): number | undefined {
  return !!value && !isNullOrEmptyOrWhitespaces(value)
    ? Date.parse(value) / 1000
    : undefined
}

export function convertTimestampToDate(value: number): Date {
  return new Date(1000 * value)
}

export function isBlockchainNativeToken(blockchain: BlockchainMeta, token: Token): boolean {
  for (const feeAsset of blockchain.feeAssets) {
    if (isToken(token, blockchain.name, feeAsset.symbol, feeAsset.address)) {
      return true
    }
  }

  return false
}

export function convertPaymentHistoryToPaymentHistoryData(
  item: PaymentHistory,
  blockchains: BlockchainMeta[] | undefined,
  tokens: Token[] | undefined,
  exchangeRates: { [timestamp: number]: number | null } | undefined,
  currentExchangeRate: number | undefined,
  currency: string | undefined
): PaymentHistoryData {
  const blockchain = blockchains?.find(blockchain => blockchain.name.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase())
  const token = tokens && item.tokenSymbol ? findToken(tokens, item.blockchain, item.tokenSymbol, item.tokenAddress) : undefined

  const amountUsdAtCurTime = token && token.usdPrice
    ? tokenAmountToUsd(item.amount, token.usdPrice, token.decimals) : null

  const amountCurrencyAtCurTime = amountUsdAtCurTime && currentExchangeRate
    ? currentExchangeRate * amountUsdAtCurTime : null

  const currencyExchangeRateAtPaymentTime = exchangeRates ? exchangeRates[item.timestamp] : null

  const amountCurrencyAtPaymentTime = item.amountUsd && currencyExchangeRateAtPaymentTime
    ? currencyExchangeRateAtPaymentTime * item.amountUsd : null

  const res: PaymentHistoryData = {
    paymentId: item.paymentId,

    block: item.block,
    timestamp: item.timestamp,
    transaction: item.transaction,
    index: item.index,

    from: item.from,
    to: item.to,
    amount: item.amount,
    amountUsdAtPaymentTime: item.amountUsd,
    amountUsdAtCurTime: amountUsdAtCurTime,
    amountCurrencyAtPaymentTime: amountCurrencyAtPaymentTime,
    amountCurrencyAtCurTime: amountCurrencyAtCurTime,

    blockchain: blockchain ?? null,
    blockchainName: item.blockchain,
    token: token ?? null,
    tokenAddress: item.tokenAddress,
    tokenSymbol: item.tokenSymbol,
    tokenDecimals: item.tokenDecimals,
    tokenUsdPriceAtPaymentTime: item.tokenUsdPrice,
    tokenUsdPriceAtCurTime: token?.usdPrice ?? null,

    currency: currency ?? null,
    currencyExchangeRateAtPaymentTime: currencyExchangeRateAtPaymentTime,
    currencyExchangeRateAtCurTime: currentExchangeRate ?? null,

    ipnResult: item.ipnResult
  }

  return res
}

export function roundNumber(value: number, decimals: number) {
  return parseFloat(value.toFixed(decimals))
}

export function serializeErrorForRedux(error: unknown): unknown {
  if (error instanceof ServiceError) {
    const err = error as ServiceError
    const { name, message, code, args, stack } = err
    return { name, message, code, args, stack }
  } else if (error instanceof Error) {
    const message = convertErrorToMessage(error, '')
    const { name, stack } = error
    return { name, message, stack }
  } else {
    const err = new Error(convertErrorToMessage(error, ''))
    const { name, message } = err
    return { name, message }
  }
}

export function getTransport(chainId: number, projectId: string): Transport {
  const publicNodeRpc = PUBLIC_NODE_RPCS[chainId.toString()]
  const walletConnectRpc = PresetsUtil.WalletConnectRpcChainIds.includes(chainId)
    ? `${CoreHelperUtil.getBlockchainApiUrl()}/v1?chainId=${ConstantsUtil.EIP155}:${chainId}&projectId=${projectId}`
    : undefined

  if (!publicNodeRpc && !walletConnectRpc) {
    return http()
  }

  const arr = [http()]
  if (publicNodeRpc) {
    arr.push(http(publicNodeRpc))
  }
  if (walletConnectRpc) {
    arr.push(http(walletConnectRpc))
  }

  return fallback(arr)
}

export function hasPermission(rbacSettings: AccountRbacSettings | undefined, requiredKeys: PermissionKey[], requiredPermission: Permission): boolean {
  if (!rbacSettings) {
    return false
  }

  if (rbacSettings.isOwner) {
    return true
  }

  return requiredKeys
    .map(requiredKey => rbacSettings?.permissions[requiredKey] ?? 'Disable')
    .findIndex(
      existedPermission => PERMISSION_PRIORITY[existedPermission] >= PERMISSION_PRIORITY[requiredPermission]
    ) !== -1
}
