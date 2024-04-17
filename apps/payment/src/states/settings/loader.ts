import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch } from '../../libs/hooks/useAppDispatch'
import { useFetchSettingsCallback, useSettings } from './hook'
import { useIsWindowVisible } from '../../libs/hooks/useIsWindowVisible'
import { useInfoMessages } from '../application/hook'
import { INFO_MESSAGE_SETTINGS_ERROR } from '../../constants'
import { isNullOrEmptyOrWhitespaces } from '../../libs/utils'
import usePaymentData from '../../libs/hooks/usePaymentData'

export default function SettingsLoader(): null {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const isWindowVisible = useIsWindowVisible()
  const { id, paymentId, currency } = usePaymentData()
  const settings = useSettings()
  const fetchSettings = useFetchSettingsCallback()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  // whenever a settings is not loaded and not loading, try again to load it
  useEffect(() => {
    const load = async (idToUse: string, paymentIdToUse: string, currencyToUse: string) => {
      removeInfoMessage(INFO_MESSAGE_SETTINGS_ERROR)
      try {
        await fetchSettings(idToUse, paymentIdToUse, currencyToUse)
      } catch {
        addInfoMessage(t('states.settings.errors.settings_load_error'), INFO_MESSAGE_SETTINGS_ERROR, 'danger')
      }
    }

    if (
      !isWindowVisible ||
      isNullOrEmptyOrWhitespaces(id) ||
      isNullOrEmptyOrWhitespaces(paymentId) ||
      isNullOrEmptyOrWhitespaces(currency)
    ) {
      return
    }

    if (!settings.current && !settings.loadingRequestId && !settings.error) {
      load(id, paymentId, currency)
    }
  }, [id, paymentId, currency, settings, t, isWindowVisible, dispatch, fetchSettings, addInfoMessage, removeInfoMessage])

  return null
}
