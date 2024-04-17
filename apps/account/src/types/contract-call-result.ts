import { ApiRequestStatus } from './api-request'

export interface ContractCallResult {
  status: ApiRequestStatus
  data: string | undefined
  txId: string | undefined
  error: Error | undefined
  handle: () => void
}
