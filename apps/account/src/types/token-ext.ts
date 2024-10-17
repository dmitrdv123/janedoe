import { Token } from 'rango-sdk-basic'

export interface TokenWithId extends Token {
  id: bigint
}

export interface TokenWithBalance extends Token {
  balance: bigint
}

export interface TokenExt extends Token {
  settingIndex: number
  currency: string | null
  balance: string | null,
  balanceUsd: number | null
  balanceCurrency: number | null
}
