export type ApiRequestStatus = 'idle' | 'processing' | 'error' | 'success'

export interface ApiRequest {
  url: string
  method?: string
  body?: string
}

export interface ApiRequestResult<T> {
  data: T | undefined,
  status: ApiRequestStatus,
  error: Error | undefined,
  process: (request: ApiRequest) => Promise<T | undefined>
}
