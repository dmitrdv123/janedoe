import { useState, useEffect, useRef, useCallback } from 'react'
import isEqual from 'lodash.isequal'

import useApiRequest from './useApiRequest'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequestStatus } from '../../types/api-request'
import { ExchangeRateResponse } from '../../types/exchange-rate-response'
import { CURRENCY_USD_SYMBOL } from '../../constants'

export default function useSpecificExchangeRate(currency: string | undefined) {
  const [data, setData] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const currencyRef = useRef<string | undefined>(undefined)

  const { process: loadExchangeRate } = useApiRequest<ExchangeRateResponse>()

  const load = useCallback(async (currencyToUse: string) => {
    if (currencyToUse.toLocaleLowerCase() === CURRENCY_USD_SYMBOL.toLocaleLowerCase()) {
      setData(1)
      setError(undefined)
      setStatus('success')
    }

    setStatus('processing')
    setError(undefined)

    try {
      const result = await loadExchangeRate(ApiWrapper.instance.exchangeRateRequest(currencyToUse))
      setData(result?.exchangeRate)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setError(error as Error)
    }
  }, [loadExchangeRate])

  useEffect(() => {
    if (isEqual(currencyRef.current, currency)) {
      return
    }

    currencyRef.current = currency
    setData(undefined)
    setError(undefined)
    setStatus('idle')

    if (currency) {
      load(currency)
    }
  }, [currency, load])

  return { data, status, error }
}
