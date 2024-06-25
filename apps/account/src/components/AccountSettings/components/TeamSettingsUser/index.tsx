import { useCallback, useEffect, useState } from 'react'
import { Button, Form, Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { X } from 'react-bootstrap-icons'
import { useAccount } from 'wagmi'

import { AccountTeamSettings, AccountTeamUserSettings, Permission } from '../../../../types/account-settings'
import { PERMISSION_KEYS } from '../../../../constants'
import { assertAddress } from '../../../../libs/utils'
import RbacGuard from '../../../Guards/RbacGuard'
import { useAccountRbacSettings } from '../../../../states/account-settings/hook'

interface TeamSettingsUserProps {
  settings: AccountTeamSettings
  userSettings: AccountTeamUserSettings
  onUpdate: (settings: AccountTeamUserSettings) => void
  onRemove: () => void
}

const TeamSettingsUser: React.FC<TeamSettingsUserProps> = (props) => {
  const { settings, userSettings, onUpdate, onRemove } = props

  const [showPermissions, setShowPermissions] = useState<boolean>(false)
  const [addressErrors, setAddressErrors] = useState<string[]>([])

  const { t } = useTranslation()
  const { address } = useAccount()
  const rbacSettings = useAccountRbacSettings()

  useEffect(() => {
    const arr = assertAddress(userSettings.address, rbacSettings?.ownerAddress, settings.users.map(user => user.address))
    setAddressErrors(arr)
  }, [rbacSettings?.ownerAddress, settings.users, userSettings.address])

  const changeAddressHandler = useCallback((value: string) => {
    onUpdate({
      accountTeamUserSettingsId: userSettings.accountTeamUserSettingsId,
      address: value,
      permissions: userSettings.permissions
    })
  }, [onUpdate, userSettings.accountTeamUserSettingsId, userSettings.permissions])

  const changePermissionHandler = useCallback((key: string, value: Permission) => {
    const permissionsToUpdate = { ...userSettings.permissions }
    permissionsToUpdate[key] = value

    onUpdate({
      accountTeamUserSettingsId: userSettings.accountTeamUserSettingsId,
      address: userSettings.address,
      permissions: permissionsToUpdate
    })
  }, [userSettings.permissions, userSettings.address, userSettings.accountTeamUserSettingsId, onUpdate])

  const toggleHandler = () => {
    setShowPermissions(val => !val)
  }

  return (
    <>
      <tr className='border' >
        <td>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder={t('components.account_settings.team_settings_wallet_placeholder')}
              value={userSettings.address}
              onChange={event => changeAddressHandler(event.target.value)}
              readOnly={!rbacSettings?.isOwner && rbacSettings?.permissions['team_settings'] !== 'Modify'}
              isInvalid={addressErrors.length > 0}
            />
            <Form.Control.Feedback type="invalid">
              {(
                addressErrors.map(error =>
                  <div key={error}>{error}</div>
                )
              )}
            </Form.Control.Feedback>
          </Form.Group>
        </td>
        <td>
          <Button variant="link" onClick={() => toggleHandler()}>
            {showPermissions ? t('components.account_settings.team_settings_hide_permission') : t('components.account_settings.team_settings_show_permission')}
          </Button>
        </td>
        <td>
          {(userSettings.address.toLocaleLowerCase() !== address?.toLocaleLowerCase()) && (
            <RbacGuard requiredKeys={['team_settings']} requiredPermission='Modify' element={
              <div className='d-flex justify-content-end'>
                <Button variant="light" onClick={() => onRemove()}>
                  <X />
                </Button>
              </div>
            } />
          )}
        </td>
      </tr>
      {(showPermissions) && (
        <tr className='border'>
          <td colSpan={3}>
            <div className='mx-3'>

              {PERMISSION_KEYS.map((key) => (
                <Form.Group as={Row} className="mb-3" key={key}>
                  <Form.Label column sm="2">{t(`components.account_settings.team_settings_${key}`)} </Form.Label>
                  <Col sm="10">
                    <Form.Select
                      value={userSettings.permissions[key] ?? 'Disable'}
                      onChange={event => changePermissionHandler(key, event.target.value as Permission)}
                      disabled={!rbacSettings?.isOwner && rbacSettings?.permissions['team_settings'] !== 'Modify'}
                    >
                      <option value="Disable">{t('components.account_settings.team_settings_permission_disable')}</option>
                      <option value="View">{t('components.account_settings.team_settings_permission_view')}</option>
                      {(key !== 'balances') && (
                        <option value="Modify">{t('components.account_settings.team_settings_permission_modify')}</option>
                      )}
                    </Form.Select>
                  </Col>
                </Form.Group>
              ))}

            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TeamSettingsUser
