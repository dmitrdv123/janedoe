import { Asset } from 'rango-sdk-basic'
import { Wallet } from './wallet'

export interface PaymentSettings {
  disableConversion: boolean
  description: string | null
  wallets: Wallet[]
  assets: Asset[]
}
