import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequest, ApiRequestResult, ApiRequestStatus } from '../../types/api-request'
import { ServiceError } from '../../types/service-error'
import { useConfig } from '../../context/config/hook'

export default function useApiRequest<T>(): ApiRequestResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()
  const config = useConfig()

  const process = useCallback(async (request: ApiRequest): Promise<T | undefined> => {
    setStatus('processing')
    setError(undefined)

    try {
      const modifiedRequest = {
        ...request,
        url: request.url.replace('{baseUrlApi}', config.config?.baseUrlApi ?? '')
      }

      const response = await ApiWrapper.instance.send<T>(modifiedRequest)
      setData(response)
      setStatus('success')

      return response
    } catch (error) {
      setData(undefined)
      setStatus('error')

      if (error instanceof ServiceError) {
        const serviceError = error as ServiceError

        const err = new Error(t(serviceError.code, serviceError.args))
        setError(err)

        throw err
      } else {
        setError(error as Error)
        throw error
      }
    }
  }, [t, config])

  return { status, data, error, process }
}
