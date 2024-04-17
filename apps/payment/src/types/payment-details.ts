import { Asset, BlockchainMeta, Token } from 'rango-sdk-basic'

export interface PaymentFeeDetails {
  name: string
  amount: string
  token: Token
}

export interface PaymentDetails {
  protocolPaymentId: string
  fromBlockchain: BlockchainMeta
  fromToken: Token
  toAsset: Asset
  fromAddress: string
  toAddress: string
  fromContracts: { [key: string]: string }
  toContracts: { [key: string]: string }
  tokenAmount: string
  amountCurrencyRequired: number
  currency: string
  slippage: number | undefined
}
