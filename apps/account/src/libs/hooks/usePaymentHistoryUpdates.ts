import { useState, useCallback, useEffect, useRef } from 'react'

import useApiRequest from './useApiRequest'
import { PaymentHistoryUpdatesResponse } from '../../types/payment-history'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequestStatus } from '../../types/api-request'
import { useInterval } from './useInterval'

export default function usePaymentHistoryUpdates(from: number | undefined) {
  const [data, setData] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const fromRef = useRef<number | undefined>(undefined)

  const { process: checkPaymentHistoryUpdates } = useApiRequest<PaymentHistoryUpdatesResponse>()

  const load = useCallback(async () => {
    fromRef.current = from

    if (from === undefined) {
      setData(undefined)
      setStatus('idle')

      return
    }

    setStatus('processing')
    setError(undefined)

    try {
      const result = await checkPaymentHistoryUpdates(
        ApiWrapper.instance.accountPaymentHistoryUpdatesRequest(from)
      )

      setData(result?.size)
      setStatus('success')
    } catch (error) {
      setData(undefined)
      setError(error as Error)
      setStatus('error')
    }
  }, [from, checkPaymentHistoryUpdates])

  useInterval(load, 1000 * 60 * 1)

  useEffect(() => {
    if (from !== fromRef.current) {
      setData(undefined)
    }
  }, [from])

  return { data, status, error, load }
}
