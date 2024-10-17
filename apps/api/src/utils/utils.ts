import * as fs from 'fs'
import path from 'path'
import { Address, formatUnits, getAddress, isAddress, parseUnits } from 'viem'
import { BlockchainMeta, MetaResponse, Token } from 'rango-sdk-basic'
import { nanoid } from 'nanoid'
import { Response } from 'express'

import { IpnResult } from '@repo/dao/dist/src/interfaces/ipn'
import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

import { PaymentHistoryData } from '../interfaces/payment-history'
import { ServiceError } from '../errors/service-error'
import { logger } from './logger'
import { DEFAULT_FIAT_DECIMAL_PLACES } from '../constants'

export function assertParam(name: string, value: string | null | undefined, maxLength?: number): void {
  if (isNullOrEmptyOrWhitespaces(value)) {
    throw new ServiceError(`${name} is not set or empty`, 'common.errors.param_not_set', { name })
  }

  if (maxLength) {
    assertMaxLength(name, value, maxLength)
  }
}

export function assertNumberParam(name: string, value: number | undefined): void {
  if (value === undefined) {
    throw new ServiceError(`${name} is not set or empty`, 'common.errors.param_not_set', { name })
  }
}

export function assertMaxLength(name: string, value: string | null | undefined, maxLength: number): void {
  if (value && value.length > maxLength) {
    throw new ServiceError(
      `Length ${value.length} of parameter ${name} is exceed maximum length ${maxLength}`,
      'common.param_exceed_max_length',
      {
        name,
        length: value.length.toString(),
        max_length: maxLength.toString()
      }
    )
  }
}

export function assertObjectParam<T>(name: string, value: T): void {
  if (!value) {
    throw new ServiceError(`Parameter ${name} is not set or empty`, 'common.errors.param_not_set', { name })
  }
}

export function assertUrl(name: string, value: string): void {
  try {
    new URL(value)
  } catch {
    throw new ServiceError(`${name} is not valid url`, 'common.errors.param_not_valid_url', { name })
  }
}

export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
}

export function tryParseInt(val: string | null | undefined): number | undefined {
  if (isNullOrEmptyOrWhitespaces(val)) {
    return undefined
  }

  try {
    const parsed = parseInt(val as string)
    return isNaN(parsed) ? undefined : parsed
  } catch {
    return undefined
  }
}

export function tryParseFloat(val: string | null | undefined): number | undefined {
  if (isNullOrEmptyOrWhitespaces(val)) {
    return undefined
  }

  try {
    const parsed = parseFloat(val as string)
    return isNaN(parsed) ? undefined : parsed
  } catch {
    return undefined
  }
}

export function paramsFromUrl(url: string): string | undefined {
  const queryParamIndex = url.indexOf('?')
  return queryParamIndex === -1 ? undefined : url.substring(queryParamIndex + 1)
}

export function formatToFixed(value: bigint, decimals: number, decimalPlaces?: number | undefined) {
  if (decimalPlaces !== undefined && decimals > decimalPlaces) {
    const remainder = value % BigInt(10 ** (decimals - decimalPlaces))
    return formatUnits(value - remainder, decimals)
  } else {
    return formatUnits(value, decimals)
  }
}

export function parseToBigNumber(value: number, decimals: number): bigint {
  return parseUnits(value.toFixed(decimals), decimals)
}

export function convertBigIntToFloat(value: bigint, decimals: number): number {
  return parseFloat(formatUnits(value, decimals))
}

export function tokenAmountToUsd(amount: string, usdPrice: number | null, decimals: number): number | undefined {
  return usdPrice === null
    ? undefined
    : usdPrice * convertBigIntToFloat(BigInt(amount), decimals)
}

export function getAddressOrDefault(value: string | null | undefined, defaultValue: Address | undefined = undefined): Address | undefined {
  try {
    return !!value && isAddress(value) ? getAddress(value) : defaultValue
  } catch {
    return defaultValue
  }
}

export function minifyToken(token: Token): unknown {
  return {
    b: token.blockchain,
    a: token.address,
    s: token.symbol,
    n: token.name,
    d: token.decimals,
    i: token.image,
    p: token.usdPrice,
    ip: token.isPopular
  }
}


export function unminifyAndCorrectToken(token: Token, blockchains: { [key: string]: BlockchainMeta }): Token {
  const blockchainName = (token as any).b as string
  const tokenName = (token as any).n ? (token as any).n as string : (token as any).s as string
  const tokenDecimals = (token as any).d ? (token as any).d as number : (blockchains[blockchainName.toLocaleLowerCase()].defaultDecimals ?? 0)

  return {
    blockchain: blockchainName,
    chainId: null,
    address: (token as any).a ? (token as any).a as string : null,
    symbol: (token as any).s as string,
    name: tokenName,
    decimals: tokenDecimals,
    image: (token as any).i as string,
    usdPrice: (token as any).p ? (token as any).p as number : null,
    blockchainImage: '',
    isPopular: (token as any).ip ? (token as any).ip as boolean : false
  }
}

export async function saveFile<T>(dir: string, file: string, data: T): Promise<void> {
  const fullDir = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullDir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  const tmpFileName = `${nanoid()}.tmp`
  const tmpFilePath = path.join(fullDir, tmpFileName)

  const str = JSON.stringify(data, (_key, value) => typeof value === 'bigint' ? value.toString() : value)
  await fs.promises.writeFile(tmpFilePath, str)

  const filePath = path.join(fullDir, file)
  if (fs.existsSync(filePath)) {
    await fs.promises.rm(filePath)
  }
  await fs.promises.rename(tmpFilePath, filePath)
}

export async function loadFile<T>(file: string): Promise<T | undefined> {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    return undefined
  }

  const data = await fs.promises.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

export async function removeFile(file: string): Promise<void> {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    await fs.promises.rm(filePath)
  }
}

export function isToken(token: Token, blockchain: string, symbol: string, address: string | null): boolean {
  return token.blockchain.toLocaleLowerCase() === blockchain.toLocaleLowerCase()
    && token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
    && (
      (isNullOrEmptyOrWhitespaces(token.address) && isNullOrEmptyOrWhitespaces(address)) || token.address?.toLocaleLowerCase() === address?.toLocaleLowerCase()
    )
}

export function convertPaymentLogToPaymentHistoryData(
  paymentLog: PaymentLog,
  ipnResult: IpnResult | undefined,
  meta: MetaResponse,
  currency: string,
  currencyExchangeRateAtCurTime: number | null,
  currencyExchangeRates: { [timestamp: number]: number | null }
): PaymentHistoryData {
  const currencyExchangeRateAtPaymentTime = currencyExchangeRates[paymentLog.timestamp]

  const token = paymentLog.tokenSymbol
    ? meta.tokens.find(token => paymentLog.tokenSymbol && isToken(token, paymentLog.blockchain, paymentLog.tokenSymbol, paymentLog.tokenAddress))
    : undefined

  const amountUsdAtCurTime = token?.usdPrice
    ? tokenAmountToUsd(paymentLog.amount, token.usdPrice, token.decimals) ?? null
    : null
  const amountCurrencyAtPaymentTime = paymentLog.amountUsd && currencyExchangeRateAtPaymentTime
    ? currencyExchangeRateAtPaymentTime * paymentLog.amountUsd
    : null
  const amountCurrencyAtCurTime = amountUsdAtCurTime && currencyExchangeRateAtCurTime
    ? currencyExchangeRateAtCurTime * amountUsdAtCurTime
    : null

  return {
    id: paymentLog.accountId,
    paymentId: paymentLog.paymentId,

    block: paymentLog.block,
    timestamp: paymentLog.timestamp,
    transaction: paymentLog.transaction,
    index: paymentLog.index,

    from: paymentLog.from,
    to: paymentLog.to,
    direction: paymentLog.direction,
    amount: paymentLog.amount,
    amountUsdAtPaymentTime: paymentLog.amountUsd === null ? null : roundNumber(paymentLog.amountUsd, DEFAULT_FIAT_DECIMAL_PLACES),
    amountUsdAtCurTime: amountUsdAtCurTime === null ? null : roundNumber(amountUsdAtCurTime, DEFAULT_FIAT_DECIMAL_PLACES),
    amountCurrencyAtPaymentTime: amountCurrencyAtPaymentTime === null ? null : roundNumber(amountCurrencyAtPaymentTime, DEFAULT_FIAT_DECIMAL_PLACES),
    amountCurrencyAtCurTime: amountCurrencyAtCurTime === null ? null : roundNumber(amountCurrencyAtCurTime, DEFAULT_FIAT_DECIMAL_PLACES),

    blockchain: paymentLog.blockchain,
    tokenAddress: paymentLog.tokenAddress,
    tokenSymbol: paymentLog.tokenSymbol,
    tokenDecimals: paymentLog.tokenDecimals,
    tokenUsdPriceAtPaymentTime: paymentLog.tokenUsdPrice,
    tokenUsdPriceAtCurTime: token?.usdPrice ?? null,

    currency: currency,
    currencyExchangeRateAtPaymentTime: currencyExchangeRateAtPaymentTime,
    currencyExchangeRateAtCurTime: currencyExchangeRateAtCurTime,

    ipnResult: ipnResult ?? null
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function processControllerError(res: Response, error: Error) {
  logger.error(error)
  if (error instanceof ServiceError) {
    return res.status(500).send({ code: error.code, message: error.message, args: error.args })
  } else {
    return res.status(500).send({ message: 'Internal server error' })
  }
}

export function roundNumber(value: number, decimals: number) {
  return parseFloat(value.toFixed(decimals))
}
