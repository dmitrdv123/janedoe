import { nanoid } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { fetchSettings } from './action'
import { convertErrorToMessage } from '../../libs/utils'
import { AppState } from '../store'
import { AppSettings } from '../../types/app-settings'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'

export function useSettings(): AppState['settings'] {
  return useAppSelector(state => state.settings)
}

export function useFetchSettingsCallback(): () => Promise<AppSettings | undefined> {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { process: loadSettings } = useApiRequest<AppSettings>()

  return useCallback(async () => {
    const requestId = nanoid()
    dispatch(fetchSettings.pending({ requestId }))
    try {
      const settings = await loadSettings(ApiWrapper.instance.settingsRequest())
      if (settings) {
        dispatch(fetchSettings.fulfilled({ settings, requestId }))
      } else {
        dispatch(fetchSettings.rejected({ requestId, errorMessage: t('states.settings.errors.not_found')}))
      }
      return settings
    } catch (error) {
      dispatch(fetchSettings.rejected({ requestId, errorMessage: convertErrorToMessage(error, t('common.errors.default')) }))
      throw error
    }
  }, [t, dispatch, loadSettings])
}
