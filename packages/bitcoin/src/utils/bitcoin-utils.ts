import { formatUnits, parseUnits } from 'viem'

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
