import { nanoid } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { fetchExchangeRate } from './action'
import { convertErrorToMessage } from '../../libs/utils'
import { AppState } from '../store'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { ExchangeRateResponse } from '../../types/exchange-rate-response'
import { useAccountCommonSettings } from '../account-settings/hook'
import { CURRENCY_USD_SYMBOL } from '../../constants'

export function useExchangeRate(): AppState['exchangeRate'] {
  return useAppSelector(state => state.exchangeRate)
}

export function useFetchExchangeRateCallback(): () => Promise<ExchangeRateResponse | undefined> {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { process: loadExchangeRate } = useApiRequest<ExchangeRateResponse>()
  const commonSettings = useAccountCommonSettings()

  return useCallback(async () => {
    if (!commonSettings) {
      return
    }

    const requestId = nanoid()
    dispatch(fetchExchangeRate.pending({ requestId }))

    try {
      const currency = commonSettings.currency ?? CURRENCY_USD_SYMBOL
      const exchangeRate = currency.toLocaleLowerCase() === CURRENCY_USD_SYMBOL
        ? { exchangeRate: 1 }
        : await loadExchangeRate(ApiWrapper.instance.exchangeRateRequest(currency))

      if (exchangeRate) {
        dispatch(fetchExchangeRate.fulfilled({ exchangeRate, requestId }))
      } else {
        dispatch(fetchExchangeRate.rejected({ requestId, errorMessage: t('states.exchange_rate.errors.not_found')}))
      }
      return exchangeRate
    } catch (error) {
      dispatch(fetchExchangeRate.rejected({ requestId, errorMessage: convertErrorToMessage(error) }))
      throw error
    }
  }, [t, commonSettings, dispatch, loadExchangeRate])
}
