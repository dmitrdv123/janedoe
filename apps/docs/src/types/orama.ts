import { Orama, TypedDocument } from '@orama/orama'

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
