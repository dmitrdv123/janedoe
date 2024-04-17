import { Token } from 'rango-sdk-basic'

export interface TokenWithBalance extends Token {
  balance: bigint
}
