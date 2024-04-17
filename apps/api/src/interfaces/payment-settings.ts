import { Asset } from 'rango-sdk-basic'
import { Wallet } from './wallet'

export interface PaymentSettings {
  description: string | null
  wallets: Wallet[]
  assets: Asset[]
}
