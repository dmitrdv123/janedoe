import { Token } from 'rango-sdk-basic'

export interface TokenWithBalance extends Token {
  currency: string
  balance: string | null,
  balanceUsd: number | null
  balanceCurrency: number | null
}
