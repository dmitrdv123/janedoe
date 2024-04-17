import { Orama, TypedDocument } from '@orama/orama'

export const blockchainSchema = {
  name: 'string',
  displayName: 'string',
  logo: 'string',
  sort: 'number'
} as const // <-- this is important

export type BlockchainDocument = TypedDocument<Orama<typeof blockchainSchema>>

export const tokenSchema = {
  blockchain: 'string',
  chainId: 'string',
  address: 'string',
  symbol: 'string',
  name: 'string',
  decimals: 'number',
  image: 'string',
  blockchainImage: 'string',
  usdPrice: 'number',
  isPopular: 'boolean'
} as const // <-- this is important

export type TokenDocument = TypedDocument<Orama<typeof tokenSchema>>

export const tokenWithBalanceSchema = {
  blockchain: 'string',
  chainId: 'string',
  address: 'string',
  symbol: 'string',
  name: 'string',
  decimals: 'number',
  image: 'string',
  blockchainImage: 'string',
  usdPrice: 'number',
  isPopular: 'boolean',
  currency: 'string',
  balance: 'string',
  balanceUsd: 'number',
  balanceCurrency: 'number'
} as const // <-- this is important

export type TokenWithBalanceDocument = TypedDocument<Orama<typeof tokenWithBalanceSchema>>
