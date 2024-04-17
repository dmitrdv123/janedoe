import { Token } from 'rango-sdk-basic'

export interface TokensWithTimestamp {
  tokens: Token[]
  timestamp: number
}

export interface TokensWithTimestampWithId extends TokensWithTimestamp {
  _id: string
}
