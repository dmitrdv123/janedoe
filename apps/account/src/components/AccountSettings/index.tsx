import React from 'react'
import { useTranslation } from 'react-i18next'

import RbacGuard from '../Guards/RbacGuard'
import CommonSettings from './components/CommonSettings'
import ApiSettings from './components/ApiSettings'
import NotificationSettings from './components/NotificationSettings'
import TeamSettings from './components/TeamSettings'

const AccountSettings: React.FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <h3 className="mb-3">{t('components.account_settings.title')}</h3>

      <RbacGuard requiredKeys={['common_settings']} requiredPermission='View' element={<CommonSettings />} />
      <RbacGuard requiredKeys={['notification_settings']} requiredPermission='View' element={<NotificationSettings />} />
      <RbacGuard requiredKeys={['api_settings']} requiredPermission='View' element={<ApiSettings />} />
      <RbacGuard requiredKeys={['team_settings']} requiredPermission='View' element={<TeamSettings />} />
    </>
  )
}

export default AccountSettings
