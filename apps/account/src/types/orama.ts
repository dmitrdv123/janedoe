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

export const tokenExtSchema = {
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
  settingIndex: 'number',
  balance: 'string',
  balanceUsd: 'number',
  balanceCurrency: 'number'
} as const // <-- this is important

export type TokenExtDocument = TypedDocument<Orama<typeof tokenExtSchema>>

export const currencySchema = {
  symbol: 'string',
  desc: 'string',
  country: 'string'
} as const // <-- this is important

export type CurrencyDocument = TypedDocument<Orama<typeof currencySchema>>
