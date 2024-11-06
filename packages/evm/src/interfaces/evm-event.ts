import { Address, Hex } from 'viem'

export type EvmPaymentDirection = 'incoming' | 'outgoing'

export interface EvmPayment {
  blockNumber: bigint
  transactionHash: `0x${string}`
  dt: bigint
  from: Address
  to: Address
  token: Address
  amount: bigint
  paymentId: string
  direction: EvmPaymentDirection
}

export interface EvmPaymentEvent {
  dt: bigint
  from: Address
  to: Address
  token: Address
  amount: bigint
  paymentId: Hex
}

export interface EvmWithdrawEvent {
  dt: bigint
  from: Address
  to: Address
  token: Address
  amount: bigint
}

export interface EvmWithdrawBatchEvent {
  dt: bigint
  from: Address
  accounts: Address[]
  tokens: Address[]
  amounts: bigint[]
}

export interface EvmEvent<T> {
  blockNumber: bigint
  transactionHash: `0x${string}`
  data: T
}
