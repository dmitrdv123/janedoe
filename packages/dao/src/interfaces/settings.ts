export interface AppSettingsBlockchain {
  blockchain: string
}

export interface AppSettingsContracts {
  chainId: string
  blockchain: string
  contractAddresses: { [key: string]: string }
  contractDetails?: { [key: string]: string }
}

export interface AppSettingsCurrency {
  symbol: string
  desc: string
  country: string
}

export interface AppSettings {
  disableConversion: boolean
  paymentBlockchains: AppSettingsBlockchain[]
  contracts: AppSettingsContracts[]
  currencies: AppSettingsCurrency[]
}
