import { Asset, MetaResponse } from "rango-sdk-basic"

export interface AppSettingsBlockchain {
  blockchain: string
}

export interface AppSettingsContracts {
  chainId: string
  blockchain: string
  contractAddresses: { [key: string]: string }
}

export interface AppSettings {
  paymentBlockchains: AppSettingsBlockchain[]
  contracts: AppSettingsContracts[]
}

export interface Wallet {
  blockchain: string
  address: string
}

export interface PaymentSettings {
  description: string | undefined
  wallets: Wallet[]
  assets: Asset[]
}

export interface Settings {
  appSettings: AppSettings
  paymentSettings: PaymentSettings
  meta: MetaResponse
  exchangeRate: number
}
