import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFetchSettingsCallback, useSettings } from './hook'
import { useInfoMessages } from '../application/hook'
import { INFO_MESSAGE_SETTINGS_ERROR } from '../../constants'

export default function SettingsLoader(): null {
  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const settings = useSettings()
  const fetchSettings = useFetchSettingsCallback()

  // whenever a settings is not loaded and not loading, try again to load it
  useEffect(() => {
    const load = async () => {
      if (settings.current || settings.loadingRequestId || settings.error) {
        return
      }

      removeInfoMessage(INFO_MESSAGE_SETTINGS_ERROR)
      try {
        await fetchSettings()
      } catch (error) {
        addInfoMessage(t('states.settings.errors.load_error'), INFO_MESSAGE_SETTINGS_ERROR, 'danger')
      }
    }

    load()
  }, [t, settings, fetchSettings, addInfoMessage, removeInfoMessage])

  return null
}
