import { Address, Hex } from 'viem'

export interface EvmPaymentEvent {
  paymentId: Hex
  dt: bigint
  from: Address
  to: Address
  token: Address
  amount: bigint
}

export interface EvmEvent<T> {
  blockNumber: bigint
  transactionHash: `0x${string}`
  logIndex: number
  data: T
}
