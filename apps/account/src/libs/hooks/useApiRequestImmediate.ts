import { useCallback, useEffect, useRef } from 'react'

import { ApiRequest } from '../../types/api-request'
import useApiRequest from './useApiRequest'

export default function useApiRequestImmediate<T>(request: ApiRequest) {
  const {status, data, error, process} = useApiRequest<T>()
  const isProcessed = useRef<boolean>(false)

  const reprocess = useCallback(async (): Promise<void> => {
    if (status === 'processing') {
      return
    }

    try {
      await process(request)
    } catch {
      return undefined
    }
  }, [status, request, process])

  useEffect(() => {
    if (!isProcessed.current) {
      isProcessed.current = true
      reprocess()
    }
  }, [status, reprocess])

  return { status, data, error, reprocess }
}
