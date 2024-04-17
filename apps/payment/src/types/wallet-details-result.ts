import { WalletDetail } from 'rango-sdk-basic'

export interface WalletDetailsResult {
  data: WalletDetail | undefined
  isLoading: boolean
}
