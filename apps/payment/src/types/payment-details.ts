import { BlockchainMeta, Token } from 'rango-sdk-basic'

export interface PaymentFeeDetails {
  name: string
  amount: string
  token: Token
}

export interface PaymentDetails {
  protocolPaymentId: string
  fromBlockchain: BlockchainMeta
  fromToken: Token
  toBlockchain: BlockchainMeta
  toToken: Token
  fromAddress: string
  toAddress: string
  fromContracts: { [key: string]: string }
  toContracts: { [key: string]: string }
  fromTokenAmount: string
  toTokenAmount: string
  currencyAmount: number
  currency: string
  slippage: number | undefined
}
