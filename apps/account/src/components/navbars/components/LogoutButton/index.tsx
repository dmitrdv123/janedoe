import { useCallback } from 'react'
import { Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useLocalStorageState from 'use-local-storage-state'
import { useDisconnect } from 'wagmi'

import { AuthData } from '../../../../types/auth-data'
import { useInfoMessages } from '../../../../states/application/hook'
import { AUTH_DATA_KEY } from '../../../../constants'

const LogoutButton: React.FC = () => {
  const { t } = useTranslation()
  const [, , { removeItem: removeAuthData }] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)
  const navigate = useNavigate()
  const { disconnect } = useDisconnect()

  const { clearInfoMessage } = useInfoMessages()

  const logoutHandler = useCallback(() => {
    clearInfoMessage()
    removeAuthData()
    disconnect()
    navigate('/')
  }, [clearInfoMessage, disconnect, navigate, removeAuthData])

  return (
    <Nav.Item>
      <Nav.Link
        as="button"
        onClick={logoutHandler}
      >
        {t('components.navbar.logout_btn')}
      </Nav.Link >
    </Nav.Item >
  )
}

export default LogoutButton
