import { ApiRequestStatus } from './api-request'

export interface ContractCallResult {
  status: ApiRequestStatus
  data: string | undefined
  txId?: string
  error: Error | undefined
  handle: () => void
}
