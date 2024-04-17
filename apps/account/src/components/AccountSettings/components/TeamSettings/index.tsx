import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Spinner, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import isEqual from 'lodash.isequal'
import { nanoid } from '@reduxjs/toolkit'
import { useAccount } from 'wagmi'

import { useAccountRbacSettings, useAccountTeamSettings, useUpdateAccountRbacSettingsCallback, useUpdateAccountTeamSettingsCallback } from '../../../../states/account-settings/hook'
import { AccountRbacSettings, AccountTeamSettings, AccountTeamUserSettings } from '../../../../types/account-settings'
import { useInfoMessages } from '../../../../states/application/hook'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { DEFAULT_PERMISSIONS, INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_ERROR, INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_SAVING_ERROR } from '../../../../constants'
import { assertAccountTeamSettings } from '../../../../libs/utils'
import TeamSettingsUser from '../TeamSettingsUser'
import RbacGuard from '../../../Guards/RbacGuard'

const TeamSettings: React.FC = () => {
  const [currentTeamSettings, setCurrentTeamSettings] = useState<AccountTeamSettings | undefined>(undefined)
  const [teamSettingsValidated, setTeamSettingsValidated] = useState(true)
  const [isTeamSettingsSaveEnabled, setIsTeamSettingsSaveEnabled] = useState(false)

  const { t } = useTranslation()

  const teamSettings = useAccountTeamSettings()
  const rbacSettings = useAccountRbacSettings()
  const { address } = useAccount()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const { status: saveTeamSettingsStatus, process: saveTeamSettings } = useApiRequest<AccountTeamSettings>()
  const updateTeamSettings = useUpdateAccountTeamSettingsCallback()
  const updateRbacSettings = useUpdateAccountRbacSettingsCallback()

  useEffect(() => {
    setCurrentTeamSettings(teamSettings)
  }, [teamSettings])

  useEffect(() => {
    const isEnable = !isEqual(teamSettings, currentTeamSettings) && assertAccountTeamSettings(currentTeamSettings, rbacSettings?.ownerAddress).length === 0
    setIsTeamSettingsSaveEnabled(isEnable)
  }, [currentTeamSettings, rbacSettings?.ownerAddress, teamSettings])

  const removeUserHandler = useCallback((index: number) => {
    setCurrentTeamSettings(settings => {
      if (!settings || settings.users.length <= index) {
        return settings
      }

      const users = [...settings.users]
      users.splice(index, 1)

      return {
        users
      }
    })
  }, [])

  const removeAllTeamsSettingsHandler = () => {
    setCurrentTeamSettings({
      users: []
    })
  }

  const addUserTeamsSettingsHandler = () => {
    setCurrentTeamSettings(settings => (
      {
        users: [
          ...(settings?.users ?? []),
          {
            accountTeamUserSettingsId: nanoid(),
            address: '',
            permissions: DEFAULT_PERMISSIONS
          }
        ]
      }
    ))
  }

  const updateAccountTeamSettingsHandler = useCallback((index: number, userSettings: AccountTeamUserSettings) => {
    setCurrentTeamSettings(settings => {
      if (!settings || settings.users.length <= index) {
        return settings
      }

      const users = [...settings?.users ?? []]
      users[index] = userSettings

      return {
        users
      }
    })
  }, [])

  const saveTeamSettingsHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    const validateAccountTeamSettings = (settings: AccountTeamSettings): boolean => {
      const errors = assertAccountTeamSettings(settings, rbacSettings?.ownerAddress)

      if (errors.length === 0) {
        removeInfoMessage(INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_ERROR)
      } else {
        addInfoMessage(errors.join('. '), INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_ERROR, 'danger')
      }

      return errors.length === 0
    }

    event.preventDefault()

    const settingsToSave: AccountTeamSettings = {
      users: currentTeamSettings?.users ?? []
    }

    const form = event.currentTarget
    if (!form.checkValidity() || !validateAccountTeamSettings(settingsToSave)) {
      event.stopPropagation()
    } else {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_SAVING_ERROR)
      try {
        await saveTeamSettings(ApiWrapper.instance.saveAccountTeamSettingsRequest(settingsToSave))
        updateTeamSettings(settingsToSave)

        if (address && rbacSettings && !rbacSettings.isOwner) {
          const currentUserTeamSettings = settingsToSave.users.find(item => item.address.toLocaleLowerCase() === address?.toLocaleLowerCase())

          const rbacSettingsToSave: AccountRbacSettings | undefined = currentUserTeamSettings
            ? {
              isOwner: rbacSettings.isOwner,
              ownerAddress: rbacSettings.ownerAddress,
              permissions: currentUserTeamSettings.permissions
            }
            : undefined

          updateRbacSettings(rbacSettingsToSave)
        }
      } catch (error) {
        addInfoMessage(t('components.account_settings.errors.fail_save_team_settings'), INFO_MESSAGE_ACCOUNT_TEAM_SETTINGS_SAVING_ERROR, 'danger')
      }
    }

    setTeamSettingsValidated(true)
  }, [t, address, rbacSettings, currentTeamSettings?.users, saveTeamSettings, updateTeamSettings, updateRbacSettings, addInfoMessage, removeInfoMessage])

  return (
    <Card className='mb-3'>
      <Card.Body>
        <Card.Title>
          {t('components.account_settings.team_settings_title')}
        </Card.Title>
        <Form noValidate validated={teamSettingsValidated} onSubmit={saveTeamSettingsHandler} onBlur={(event) => event.currentTarget.checkValidity()}>
          <Table borderless>
            <thead>
              <tr className='border'>
                <th scope="col">{t('components.account_settings.team_settings_wallet_col')}</th>
                <th scope="col">{t('components.account_settings.team_settings_permissions_col')}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {(!currentTeamSettings?.users) && (
                <tr className='border'>
                  <td colSpan={3}>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                      <span className="visually-hidden">{t('common.loading')}</span>
                    </Spinner>
                  </td>
                </tr>
              )}

              {(currentTeamSettings?.users && currentTeamSettings.users.length === 0) && (
                <tr className='border'>
                  <td colSpan={3}>
                    {t('components.account_settings.team_settings_no_users')}
                  </td>
                </tr>
              )}

              {(currentTeamSettings?.users && currentTeamSettings.users.length > 0) && (
                currentTeamSettings.users.map((userSettings, i) =>
                  <TeamSettingsUser
                    key={userSettings.accountTeamUserSettingsId}
                    settings={currentTeamSettings}
                    userSettings={userSettings}
                    onUpdate={(userSettingsToUpdate: AccountTeamUserSettings) => updateAccountTeamSettingsHandler(i, userSettingsToUpdate)}
                    onRemove={() => removeUserHandler(i)}
                  />
                )
              )}
            </tbody>
          </Table>

          <RbacGuard requiredKeys={['team_settings']} requiredPermission='Modify' element={

            <>
              <Button variant="primary" type="submit" disabled={saveTeamSettingsStatus === 'processing' || !isTeamSettingsSaveEnabled}>
                {t('common.save_btn')}
                {(saveTeamSettingsStatus === 'processing') && (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                    <span className="visually-hidden">{t('common.saving')}</span>
                  </Spinner>
                )}
              </Button>
              <Button variant="outline-secondary" type="button" className='ms-1' disabled={saveTeamSettingsStatus === 'processing'} onClick={() => addUserTeamsSettingsHandler()}>
                {t('components.account_settings.team_settings_add_user')}
              </Button>
              <Button variant="outline-secondary" type="button" className='ms-1' disabled={saveTeamSettingsStatus === 'processing'} onClick={() => removeAllTeamsSettingsHandler()}>
                {t('components.account_settings.team_settings_remove_users')}
              </Button>
            </>

          } />
        </Form>
      </Card.Body>
    </Card >
  )
}

export default TeamSettings
