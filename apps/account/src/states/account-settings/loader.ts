import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFetchAccountSettingsCallback } from './hook'
import { INFO_MESSAGE_ACCOUNT_SETTINGS_ERROR } from '../../constants'
import { useInfoMessages } from '../application/hook'

export default function AccountSettingsLoader() {
  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const fetchAccountSettings = useFetchAccountSettingsCallback()

  // whenever a account settings is not loaded and not loading, try again to load it
  useEffect(() => {
    async function fetchData() {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_SETTINGS_ERROR)
      try {
        await fetchAccountSettings()
      } catch (error) {
        addInfoMessage(t('states.account_settings.errors.load_error'), INFO_MESSAGE_ACCOUNT_SETTINGS_ERROR, 'danger')
      }
    }

    fetchData()
  }, [t, fetchAccountSettings, addInfoMessage, removeInfoMessage])

  return null
}
