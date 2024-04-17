import { ApiRequestStatus } from "./api-request"

export interface AccountReceivedAmount {
  received: number
}

export interface AccountReceivedAmountResult {
  data: AccountReceivedAmount | undefined
  status: ApiRequestStatus
  error: Error | undefined
}
