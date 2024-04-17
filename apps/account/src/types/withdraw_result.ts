import { BlockchainMeta } from 'rango-sdk-basic'

export interface WithdrawResult {
  blockchain: BlockchainMeta
  hash: string | undefined
}
