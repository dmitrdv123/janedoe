import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch } from '../../libs/hooks/useAppDispatch'
import { useInterval } from '../../libs/hooks/useInterval'
import { useExchangeRate, useFetchExchangeRateCallback } from './hook'
import { useIsWindowVisible } from '../../libs/hooks/useIsWindowVisible'
import { useInfoMessages } from '../application/hook'
import { INFO_MESSAGE_EXCHANGE_RATE_ERROR } from '../../constants'
import { useAccountCommonSettings } from '../account-settings/hook'

export default function ExchangeRateUpdater(): null {
  const dispatch = useAppDispatch()
  const isWindowVisible = useIsWindowVisible()
  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const commonSettings = useAccountCommonSettings()
  const exchangeRate = useExchangeRate()
  const fetchExchangeRate = useFetchExchangeRateCallback()

  const [currentCurrency, setCurrentCurrency] = useState<string | null>(null)

  const fetchExchangeRateCallback = useCallback(() => {
    const load = async () => {
      removeInfoMessage(INFO_MESSAGE_EXCHANGE_RATE_ERROR)
      try {
        await fetchExchangeRate()
      } catch {
        addInfoMessage(t('states.exchange_rate.errors.load_error'), INFO_MESSAGE_EXCHANGE_RATE_ERROR, 'danger')
      }
    }

    if (isWindowVisible) {
      load()
    }
  }, [t, isWindowVisible, fetchExchangeRate, addInfoMessage, removeInfoMessage])

  // fetch all lists every 10 minutes
  useInterval(fetchExchangeRateCallback, 1000 * 60 * 10)

  useEffect(() => {
    const load = async () => {
      removeInfoMessage(INFO_MESSAGE_EXCHANGE_RATE_ERROR)
      try {
        await fetchExchangeRate()
      } catch {
        addInfoMessage(t('states.exchange_rate.errors.load_error'), INFO_MESSAGE_EXCHANGE_RATE_ERROR, 'danger')
      }
    }

    if (commonSettings && currentCurrency !== commonSettings.currency) {
      load()
      setCurrentCurrency(commonSettings.currency ?? null)
    }
  }, [currentCurrency, commonSettings, t, fetchExchangeRate, addInfoMessage, removeInfoMessage])

  // whenever a exchange rate is not loaded and not loading, try again to load it
  useEffect(() => {
    const load = async () => {
      removeInfoMessage(INFO_MESSAGE_EXCHANGE_RATE_ERROR)
      try {
        await fetchExchangeRate()
      } catch {
        addInfoMessage(t('states.exchange_rate.errors.load_error'), INFO_MESSAGE_EXCHANGE_RATE_ERROR, 'danger')
      }
    }

    if (!exchangeRate.current && !exchangeRate.loadingRequestId && !exchangeRate.error) {
      load()
    }
  }, [t, exchangeRate, dispatch, fetchExchangeRate, addInfoMessage, removeInfoMessage])

  return null
}
