import { ApiRequestStatus } from './api-request'
import { TokenWithBalance } from './token-with-balance'

export interface ReadBalancesResult {
  status: ApiRequestStatus
  error: Error | null
  tokens: TokenWithBalance[] | undefined
  refetch: (() => void) | undefined
}
