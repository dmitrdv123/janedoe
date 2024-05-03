import React, { useCallback } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useUpdateAccountApiSettingsCallback } from '../../../../states/account-settings/hook'
import { AccountApiSettings } from '../../../../types/account-settings'
import { useInfoMessages } from '../../../../states/application/hook'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_ACCOUNT_API_SETTINGS_SAVING_ERROR } from '../../../../constants'

interface ApiSettingsButtonsProps {
  apiKey: string
}

const ApiSettingsButtons: React.FC<ApiSettingsButtonsProps> = (props) => {
  const { apiKey } = props

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const { status: saveApiSettingsStatus, process: saveApiSettings } = useApiRequest<AccountApiSettings>()
  const updateApiSettings = useUpdateAccountApiSettingsCallback()

  const generateKeyApiSettingsHandler = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_ACCOUNT_API_SETTINGS_SAVING_ERROR)
    try {
      const settingsToSave = await saveApiSettings(ApiWrapper.instance.generateAccountApiKeyRequest())
      updateApiSettings(settingsToSave)
    } catch (error) {
      addInfoMessage(
        t('components.account_settings.errors.fail_generate_api_key'),
        INFO_MESSAGE_ACCOUNT_API_SETTINGS_SAVING_ERROR,
        'danger',
        error
      )
    }
  }, [t, addInfoMessage, removeInfoMessage, saveApiSettings, updateApiSettings])

  const removeKeyApiSettingsHandler = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_ACCOUNT_API_SETTINGS_SAVING_ERROR)
    try {
      await saveApiSettings(ApiWrapper.instance.removeAccountApiKeyRequest())
      updateApiSettings(undefined)
    } catch (error) {
      addInfoMessage(t('components.account_settings.errors.fail_remove_api_key'), INFO_MESSAGE_ACCOUNT_API_SETTINGS_SAVING_ERROR, 'danger')
    }
  }, [t, addInfoMessage, removeInfoMessage, saveApiSettings, updateApiSettings])

  return (
    <>
      <Button variant="primary" type="button" disabled={saveApiSettingsStatus === 'processing'} onClick={() => generateKeyApiSettingsHandler()}>
        {t('components.account_settings.api_generate_btn')}
        {(saveApiSettingsStatus === 'processing') && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
            <span className="visually-hidden">{t('common.saving')}</span>
          </Spinner>
        )}
      </Button>
      <Button variant="outline-secondary" type="button" className='ms-1' disabled={!apiKey || saveApiSettingsStatus === 'processing'} onClick={() => removeKeyApiSettingsHandler()}>
        {t('components.account_settings.api_remove_btn')}
        {(saveApiSettingsStatus === 'processing') && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
            <span className="visually-hidden">{t('common.saving')}</span>
          </Spinner>
        )}
      </Button>
    </>
  )
}

export default ApiSettingsButtons
