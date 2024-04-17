export interface BlockchainEvmClientConfig {
  chainId: string,
  blockchain: string,
  transport: string,
  rpcUrl: string,
  maxBlockRange: number
}
