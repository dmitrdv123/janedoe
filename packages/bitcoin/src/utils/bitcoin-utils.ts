import * as bitcoin from 'bitcoinjs-lib'
import { formatUnits, parseUnits } from 'viem'

import appConfig from '@repo/common/dist/src/app-config'
import { BitcoinUtxoData } from '@repo/dao/dist/src/interfaces/bitcoin'

import { BITCOIN_DECIMALS } from '../constants'

export function parseToBigNumber(value: number, decimals: number): bigint {
  return parseUnits(value.toFixed(decimals), decimals)
}

export function convertBigIntToFloat(value: bigint, decimals: number): number {
  return parseFloat(formatUnits(value, decimals))
}

export function parseBigIntToNumber(value: bigint): number {
  const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER)
  const minSafeInteger = BigInt(Number.MIN_SAFE_INTEGER)

  if (value > maxSafeInteger || value < minSafeInteger) {
    throw new Error('Cannot convert bigint to number since value is outside the safe range for a number')
  }

  return Number(value)
}

export function getBitcoinNetwork(): bitcoin.networks.Network {
  switch (appConfig.BITCOIN_NETWORK) {
    case 'mainnet':
      return bitcoin.networks.bitcoin
    case 'regtest':
      return bitcoin.networks.regtest
    case 'testnet':
      return bitcoin.networks.testnet
    default:
      return bitcoin.networks.regtest
  }
}

export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
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

export function totalAmountUtxos(utxos: BitcoinUtxoData[]): bigint {
  return utxos.reduce((acc, utxo) => {
    const delta = parseToBigNumber(utxo.amount, BITCOIN_DECIMALS) - parseToBigNumber(utxo.frozen, BITCOIN_DECIMALS)
    if (delta > BigInt(0)) {
      acc += delta
    }
    return acc
  }, BigInt(0))
}
