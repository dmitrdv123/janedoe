import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useLocalStorageState from 'use-local-storage-state'

import { AuthData } from '../../types/auth-data'
import { UnathError } from '../../types/unauth-error'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequest, ApiRequestResult, ApiRequestStatus } from '../../types/api-request'
import { useConfig } from '../../context/config/hook'
import { AUTH_DATA_KEY } from '../../constants'

export default function useApiRequest<T>(): ApiRequestResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const { id } = useParams()
  const [authData, , { removeItem: removeAuthData }] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)
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
      } else {
        setError(error as Error)
        throw error
      }
    }
  }, [authData, id, config, navigate, removeAuthData])

  return { status, data, error, process }
}
