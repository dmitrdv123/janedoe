import { CoreHelperUtil } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { Asset, BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'
import { Address, Transport, encodeAbiParameters, fallback, formatUnits, getAddress, http, isAddress, parseAbiParameters, parseUnits, stringToHex } from 'viem'
import { TronWeb } from 'tronweb'

import { PaymentHistory, PaymentHistoryData } from '../types/payment-history'
import { ServiceError } from '../types/errors/service-error'
import { PaymentConversionError } from '../types/errors/payment-conversion-error'
import { TokenWithBalance } from '../types/token-with-balance'

export function cutString(str: string, num: number = 4, max: number = 11): string {
  if (str.length <= max || str.length <= 2 * num) {
    return str
  }

  return str.substring(0, num) + '...' + str.substring(str.length - num, str.length)
}

export function parseToBigNumber(value: number, decimals: number): bigint {
  return parseUnits(value.toFixed(decimals), decimals)
}

export function convertBigIntToFloat(value: bigint, decimals: number): number {
  return parseFloat(formatUnits(value, decimals))
}

export function blockchainComparator(a: BlockchainMeta, b: BlockchainMeta) {
  return stringComparator(a.displayName, b.displayName)
}

export function tokenResultComparator(a: TokenWithBalance, b: TokenWithBalance): number {
  const balanceUsdA = a.balanceUsd ?? 0
  const balanceUsdB = b.balanceUsd ?? 0

  if (balanceUsdA < balanceUsdB) {
    return 1
  }

  if (balanceUsdA > balanceUsdB) {
    return -1
  }

  const balanceA = a.balance ? convertBigIntToFloat(BigInt(a.balance), a.decimals) : 0
  const balanceB = b.balance ? convertBigIntToFloat(BigInt(b.balance), b.decimals) : 0

  if (balanceA > 0 && balanceB === 0) {
    return 1
  }

  if (balanceA === 0 && balanceB > 0) {
    return -1
  }

  return tokenDefaultResultComparator(a, b)
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

export function stringComparator(a: string, b: string) {
  if (!a || !b) {
    return -1
  }

  return a.toLocaleLowerCase() > b.toLocaleLowerCase() ? 1 : -1
}

export function getAddressOrDefault(value: string | null | undefined, defaultValue: Address = '0x0'): Address {
  try {
    return value && isAddress(value) ? getAddress(value) : defaultValue
  } catch {
    return defaultValue
  }
}

export function getTronAddressOrDefault(value: string | null | undefined, defaultValue: Address = '0x0'): Address | undefined {
  try {
    if (!value) {
      return defaultValue
    }

    const hex = TronWeb.address.toHex(value)
    return getAddressOrDefault(`0x${hex.substring(2)}`, defaultValue)
  } catch {
    return defaultValue
  }
}

export function isBlockchainToken(blockchain: BlockchainMeta, token: Token): boolean {
  return token.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
}

export function getNativeToken(blockchain: BlockchainMeta, tokens: Token[]): Token | undefined {
  for (const feeAsset of blockchain.feeAssets) {
    const token = findToken(tokens, blockchain, feeAsset.symbol, feeAsset.address)
    if (token !== undefined) {
      return token
    }
  }

  return undefined
}

export function isNativeToken(blockchain: BlockchainMeta, token: Token): boolean {
  return blockchain.feeAssets.findIndex(asset => isAssetEqualToToken(asset, token)) !== -1
}

export function findToken(tokens: Token[], blockchain: BlockchainMeta, symbol: string, address: string | null): Token | undefined {
  return tokens.find(token => isToken(token, blockchain.name, symbol, address))
}

export function isToken(token: Token, blockchain: string, symbol: string, address: string | null): boolean {
  return token.blockchain.toLocaleLowerCase() === blockchain.toLocaleLowerCase()
    && token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(token.address) && isNullOrEmptyOrWhitespaces(address)) || token.address?.toLocaleLowerCase() === address?.toLocaleLowerCase()
    )
}

export function isAsset(asset: Asset, blockchain: string, symbol: string, address: string | null): boolean {
  return asset.blockchain.toLocaleLowerCase() === blockchain.toLocaleLowerCase()
    && asset.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(asset.address) && isNullOrEmptyOrWhitespaces(address)) || asset.address?.toLocaleLowerCase() === address?.toLocaleLowerCase()
    )
}

export function findBlockchain(blockchains: BlockchainMeta[], id: number): BlockchainMeta | undefined {
  const hexChainId = `0x${id.toString(16)}`
  return blockchains.find(blockchain => blockchain.chainId !== null && blockchain.chainId.toLocaleLowerCase() === hexChainId.toLocaleLowerCase())
}

export function findBlockchainByName(blockchains: BlockchainMeta[], name: string): BlockchainMeta | undefined {
  return blockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === name.toLocaleLowerCase())
}

export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
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

export function tryParseFloat(val: string | null | undefined): number | undefined {
  if (isNullOrEmptyOrWhitespaces(val)) {
    return undefined
  }

  try {
    return parseFloat(val as string)
  } catch {
    return undefined
  }
}

export function convertErrorToMessage(error: any, defaultMessage: string, curDepth: number = 1, maxDepth: number = 10): string {
  if ('string' === typeof error) {
    return error
  }

  if (error.shortMessage) {
    return error.shortMessage
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

export function isAssetEqualToToken(asset: Asset, token: Token) {
  return asset.blockchain.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
    && asset.symbol.toLocaleLowerCase() === token.symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(asset.address) && isNullOrEmptyOrWhitespaces(token.address)) || asset.address?.toLocaleLowerCase() === token.address?.toLocaleLowerCase()
    )
}

export function tokenAmountToUsd(amount: string, usdPrice: number, decimals: number): number {
  return usdPrice * convertBigIntToFloat(BigInt(amount), decimals)
}

export function tokenAmountToCurrency(amount: string, usdPrice: number, decimals: number, exchangeRate: number): number {
  return exchangeRate * tokenAmountToUsd(amount, usdPrice, decimals)
}

export function usdToTokenAmount(amountUsd: number, usdPrice: number, decimals: number): string {
  return parseToBigNumber(amountUsd / usdPrice, decimals).toString()
}

export function currencyToTokenAmount(amountCurrency: number, usdPrice: number, decimals: number, exchangeRate: number): string {
  return parseToBigNumber(amountCurrency / (exchangeRate * usdPrice), decimals).toString()
}

export function tokenAmountToTokenAmount(fromAmount: string, fromUsdPrice: number, fromDecimals: number, toUsdPrice: number, toDecimals: number): string {
  const fromAmountUsd = tokenAmountToUsd(fromAmount, fromUsdPrice, fromDecimals)
  return usdToTokenAmount(fromAmountUsd, toUsdPrice, toDecimals)
}

export function sameToken(a: Token, b: Token): boolean {
  return a.blockchain.toLocaleLowerCase() === b.blockchain.toLocaleLowerCase()
    && a.symbol.toLocaleLowerCase() === b.symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(a.address) && isNullOrEmptyOrWhitespaces(b.address)) || a.address?.toLocaleLowerCase() === b.address?.toLocaleLowerCase()
    )
}

export function createPaymentUrlForTransferBlockchains(
  blockchain: BlockchainMeta,
  token: Token,
  address: string,
  amount: string,
  message?: string
): string {
  if (blockchain.type !== TransactionType.TRANSFER) {
    return ''
  }

  const formattedAmount = formatToFixed(amount, token.decimals)

  let res: string = ''
  switch (blockchain.name.toLocaleLowerCase()) {
    case 'btc':
      res = `bitcoin:${address}?amount=${formattedAmount}`
      break
    case 'bch':
      res = `bitcoincash:${address}?amount=${formattedAmount}`
      break
    case 'doge':
      res = `doge:${address}?amount=${formattedAmount}`
      break
    case 'ltc':
      res = `litecoin:${address}?amount=${formattedAmount}`
      break
    case 'maya':
      res = `mayachain:${address}?amount=${formattedAmount}`
      break
    case 'polkadot':
      res = `polkadot:${address}?amount=${formattedAmount}`
      break
    case 'thor':
      res = `thorchain:${address}?amount=${formattedAmount}`
      break
  }

  return isNullOrEmptyOrWhitespaces(res) ? res : res + (isNullOrEmptyOrWhitespaces(message) ? '' : `&message=${message}`)
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function waitFor(sleepInterval: number, timeoutIntervalCount: number, condition: () => boolean, timeout: () => void) {
  let i = 0
  while (!condition()) {
    ++i
    if (i >= timeoutIntervalCount) {
      timeout()
      return
    }

    await sleep(sleepInterval)
  }
}

export function encodeStringToBytes(value: string): string {
  return stringToHex(value)
}

export function createImMessage(fromAddress: string, toAddress: string, paymentId: string): string {
  return encodeAbiParameters(
    parseAbiParameters('address from, address to, bytes paymentId'),
    [getAddress(fromAddress), getAddress(toAddress), stringToHex(paymentId)]
  )
}

export function convertTimestampToDate(value: number): Date {
  return new Date(1000 * value)
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
  const token = blockchain && tokens && item.tokenSymbol ? findToken(tokens, blockchain, item.tokenSymbol, item.tokenAddress) : undefined

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
  } else if (error instanceof PaymentConversionError) {
    const err = error as PaymentConversionError
    const { name, message, stack, data } = err
    return { name, message, stack, data }
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
  const rpc = CoreHelperUtil.getBlockchainApiUrl()
  if (!PresetsUtil.WalletConnectRpcChainIds.includes(chainId)) {
    return http()
  }

  return fallback([
    http(),
    http(`${rpc}/v1/?chainId=${ConstantsUtil.EIP155}:${chainId}&projectId=${projectId}`)
  ])
}