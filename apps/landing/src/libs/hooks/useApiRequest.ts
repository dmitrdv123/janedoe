import { useCallback, useState } from 'react'

import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequest, ApiRequestResult, ApiRequestStatus } from '../../types/api-request'
import { useConfig } from '../../context/config/hook'

export default function useApiRequest<T>(): ApiRequestResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const config = useConfig()

  const process = useCallback(async (request: ApiRequest): Promise<T | undefined> => {
    setStatus('processing')
    setError(undefined)

    try {
      const response = await ApiWrapper.instance.send<T>({
        ...request,
        url: request.url.replace('{baseUrlApi}', config.config?.baseUrlApi ?? '')
      })
      setData(response)
      setStatus('success')

      return response
    } catch (error) {
      setData(undefined)
      setError(error as Error)
      setStatus('error')

      throw error
    }
  }, [config])

  return { status, data, error, process }
}
