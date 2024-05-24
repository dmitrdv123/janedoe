import { ApiRequestStatus } from './api-request'

export enum NativePayStage { NativePay = 'hooks.native_pay.native_pay' }

export enum TokenPayStage {
  TokenAllowance = 'hooks.token_approve_and_pay.token_allowance',
  TokenResetApprove = 'hooks.token_approve_and_pay.token_reset_approve',
  TokenApprove = 'hooks.token_approve_and_pay.token_approve',
  TokenPay = 'hooks.token_approve_and_pay.token_pay'
}

export enum TokenConversionPayStage {
  SwitchChain = 'hooks.token_conversion_pay.switch_chain',
  TokenSwap = 'hooks.token_conversion_pay.token_swap',
  TokenApprove = 'hooks.token_conversion_pay.token_approve',
  TokenPay = 'hooks.token_conversion_pay.token_pay'
}

export interface ContractCallResult {
  status: ApiRequestStatus
  stage: string | undefined
  details: string | undefined
  txId?: string
  error: Error | undefined
  handle: () => void
}
