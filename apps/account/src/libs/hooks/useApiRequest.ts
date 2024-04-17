import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import useLocalStorageState from 'use-local-storage-state'

import { AuthData } from '../../types/auth-data'
import { authDataKey } from '../utils'
import { UnathError } from '../../types/unauth-error'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequest, ApiRequestResult, ApiRequestStatus } from '../../types/api-request'
import { ServiceError } from '../../types/service-error'
import { useConfig } from '../../context/config/hook'

export default function useApiRequest<T>(): ApiRequestResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()
  const { id } = useParams()
  const [authData, , { removeItem: removeAuthData }] = useLocalStorageState<AuthData>(authDataKey())
  const navigate = useNavigate()
  const config = useConfig()

  const process = useCallback(async (request: ApiRequest): Promise<T | undefined> => {
    if (request.authRequired && !authData) {
      navigate('/auth')
      return
    }

    setStatus('processing')
    setError(undefined)

    try {
      const modifiedRequest = {
        ...request,
        url: request.url.replace('{baseUrlApi}', config.config?.baseUrlApi ?? '').replace('{id}', id ?? authData?.id ?? '')
      }

      const response = await ApiWrapper.instance.send<T>(modifiedRequest, authData?.accessToken)
      setData(response)
      setStatus('success')

      return response
    } catch (error) {
      setData(undefined)
      setStatus('error')

      if (error instanceof UnathError) {
        setError(error as Error)
        removeAuthData()
        navigate('/auth')
      } else if (error instanceof ServiceError) {
        const serviceError = error as ServiceError

        const err = new Error(t(serviceError.code, serviceError.args))
        setError(err)

        throw err
      } else {
        setError(error as Error)
        throw error
      }
    }
  }, [t, authData, id, config, navigate, removeAuthData])

  return { status, data, error, process }
}
