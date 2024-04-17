import { nanoid } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, MetaResponse, Token } from 'rango-sdk-basic'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { fetchSettings } from './action'
import { convertErrorToMessage } from '../../libs/utils'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { AppSettings, PaymentSettings, Settings } from '../../types/settings'
import { AppState } from '../store'

export function useSettings(): AppState['settings'] {
  return useAppSelector(state => state.settings)
}

export function useAppSettings(): AppSettings | undefined {
  return useAppSelector(state => state.settings.current?.appSettings)
}

export function usePaymentSettings(): PaymentSettings | undefined {
  return useAppSelector(state => state.settings.current?.paymentSettings)
}

export function useMeta(): MetaResponse | undefined {
  return useAppSelector(state => state.settings.current?.meta)
}

export function useBlockchains(): BlockchainMeta[] | undefined {
  return useAppSelector(state => state.settings.current?.meta.blockchains)
}

export function useTokens(): Token[] | undefined {
  return useAppSelector(state => state.settings.current?.meta.tokens)
}

export function useExchangeRate(): number | undefined {
  return useAppSelector(state => state.settings.current?.exchangeRate)
}

export function useFetchSettingsCallback(): (id: string, paymentId: string, currency: string) => Promise<Settings | undefined> {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { process: loadSettings } = useApiRequest<Settings>()

  return useCallback(async (id: string, paymentId: string, currency: string) => {
    const requestId = nanoid()
    dispatch(fetchSettings.pending({ requestId }))

    try {
      const settings = await loadSettings(ApiWrapper.instance.settingsRequest(id, paymentId, currency))
      if (settings) {
        dispatch(fetchSettings.fulfilled({ settings, requestId }))
      } else {
        dispatch(fetchSettings.rejected({
          requestId,
          errorMessage: t('states.settings.errors.settings_load_error')
        }))
      }
      return settings
    } catch (error) {
      dispatch(fetchSettings.rejected({ requestId, errorMessage: convertErrorToMessage(error, t('common.errors.default')) }))
      throw error
    }
  }, [t, dispatch, loadSettings])
}
