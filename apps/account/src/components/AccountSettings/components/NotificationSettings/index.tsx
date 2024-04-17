import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import isEqual from 'lodash.isequal'

import { useAccountNotificationSettings, useAccountRbacSettings, useUpdateAccountNotificationSettingsCallback } from '../../../../states/account-settings/hook'
import { AccountNotificationSettings } from '../../../../types/account-settings'
import { useInfoMessages } from '../../../../states/application/hook'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_ERROR, INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_SAVING_ERROR } from '../../../../constants'
import { assertAccountNotificationSettings } from '../../../../libs/utils'
import RbacGuard from '../../../Guards/RbacGuard'

const NotificationSettings: React.FC = () => {
  const [callbackUrlNotificationSettings, setCallbackUrlNotificationSettings] = useState<string>('')
  const [secretKeyNotificationSettings, setSecretKeyNotificationSettings] = useState<string>('')
  const [notificationSettingsValidated, setNotificationSettingsValidated] = useState(true)
  const [isNotificationSettingsSaveEnabled, setIsNotificationSettingsSaveEnabled] = useState(false)
  const [showCallbackSecretKey, setShowCallbackSecretKey] = useState(false)

  const { t } = useTranslation()
  const notificationSettings = useAccountNotificationSettings()
  const rbacSettings = useAccountRbacSettings()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const { status: saveNotificationSettingsStatus, process: saveNotificationSettings } = useApiRequest<AccountNotificationSettings>()
  const updateNotificationSettings = useUpdateAccountNotificationSettingsCallback()

  useEffect(() => {
    setCallbackUrlNotificationSettings(notificationSettings?.callbackUrl ?? '')
    setSecretKeyNotificationSettings(notificationSettings?.secretKey ?? '')
  }, [notificationSettings])

  useEffect(() => {
    const currentNotificationSettings = {
      callbackUrl: callbackUrlNotificationSettings,
      secretKey: secretKeyNotificationSettings
    }
    const isEnable = !isEqual(notificationSettings, currentNotificationSettings) && assertAccountNotificationSettings(currentNotificationSettings).length === 0
    setIsNotificationSettingsSaveEnabled(isEnable)
  }, [callbackUrlNotificationSettings, secretKeyNotificationSettings, notificationSettings])

  const validateAccountNotificationSettings = useCallback((settings: AccountNotificationSettings): boolean => {
    const errors = assertAccountNotificationSettings(settings)

    if (errors.length === 0) {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_ERROR)
    } else {
      addInfoMessage(errors.join('. '), INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_ERROR, 'danger')
    }

    return errors.length === 0
  }, [addInfoMessage, removeInfoMessage])

  const saveNotificationSettingsHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const settingsToSave: AccountNotificationSettings = {
      callbackUrl: callbackUrlNotificationSettings,
      secretKey: secretKeyNotificationSettings
    }

    const form = event.currentTarget
    if (!form.checkValidity() || !validateAccountNotificationSettings(settingsToSave)) {
      event.stopPropagation()
    } else {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_SAVING_ERROR)
      try {
        await saveNotificationSettings(ApiWrapper.instance.saveAccountNotificationSettingsRequest(settingsToSave))
        updateNotificationSettings(settingsToSave)
      } catch (error) {
        addInfoMessage(t('components.account_settings.errors.fail_save_notification_settings'), INFO_MESSAGE_ACCOUNT_NOTIFICATION_SETTINGS_SAVING_ERROR, 'danger')
      }
    }

    setNotificationSettingsValidated(true)
  }, [t, callbackUrlNotificationSettings, secretKeyNotificationSettings, addInfoMessage, removeInfoMessage, saveNotificationSettings, updateNotificationSettings, validateAccountNotificationSettings])

  return (
    <Card className='mb-3'>
      <Card.Body>
        <Card.Title>
          {t('components.account_settings.notification_settings_title')}
        </Card.Title>
        <Form noValidate validated={notificationSettingsValidated} onSubmit={saveNotificationSettingsHandler} onBlur={(event) => event.currentTarget.checkValidity()}>
          <Form.Group className="mb-3">
            <Form.Label>{t('components.account_settings.notification_settings_url')}</Form.Label>
            <Form.Control
              type="url"
              placeholder={t('components.account_settings.notification_settings_url_placeholder')}
              defaultValue={callbackUrlNotificationSettings}
              onChange={event => setCallbackUrlNotificationSettings(event.target.value)}
              readOnly={!rbacSettings?.isOwner && rbacSettings?.permissions['notification_settings'] !== 'Modify'}
            />
            <Form.Control.Feedback type="invalid">
              {t('components.account_settings.notification_settings_invalid_url')}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {t('components.account_settings.notification_settings_url_desc')}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('components.account_settings.notification_settings_key')}</Form.Label>
            <InputGroup>
              <Form.Control
                type={showCallbackSecretKey ? "text" : "password"}
                placeholder={t('components.account_settings.notification_settings_key_placeholder')}
                defaultValue={secretKeyNotificationSettings}
                onChange={event => setSecretKeyNotificationSettings(event.target.value)}
                readOnly={!rbacSettings?.isOwner && rbacSettings?.permissions['notification_settings'] !== 'Modify'}
              />
              <Button variant="outline-secondary" onClick={() => setShowCallbackSecretKey(!showCallbackSecretKey)}>
                {showCallbackSecretKey ? t('common.hide_btn') : t('common.show_btn')}
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              {t('components.account_settings.notification_settings_key_desc')}
            </Form.Text>
          </Form.Group>

          <RbacGuard requiredKeys={['notification_settings']} requiredPermission='Modify' element={

            <Button variant="primary" type="submit" disabled={saveNotificationSettingsStatus === 'processing' || !isNotificationSettingsSaveEnabled}>
              {t('common.save_btn')}
              {(saveNotificationSettingsStatus === 'processing') && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                  <span className="visually-hidden">{t('common.saving')}</span>
                </Spinner>
              )}
            </Button>

          } />
        </Form>
      </Card.Body>
    </Card>
  )
}

export default NotificationSettings
