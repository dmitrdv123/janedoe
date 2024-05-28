import { ApiRequestStatus } from './api-request'

export enum NativePayStage { NativePay = 'hooks.native_pay.native_pay' }

export enum TokenPayStage {
  TokenAllowance = 'hooks.token_approve_and_pay.token_allowance',
  TokenResetApprove = 'hooks.token_approve_and_pay.token_reset_approve',
  TokenApprove = 'hooks.token_approve_and_pay.token_approve',
  TokenPay = 'hooks.token_approve_and_pay.token_pay'
}

export enum TokenConvertStage {
  TokenSwap = 'hooks.token_convert.token_swap',
  SwitchChain = 'hooks.token_convert.switch_chain',
  TokenApprove = 'hooks.token_convert.token_approve',
  TokenConvert = 'hooks.token_convert.token_convert'
}

export interface ContractCallResult {
  status: ApiRequestStatus
  stage: string | undefined
  details: string | undefined
  txId?: string
  error: Error | undefined
  handle: () => void
}
