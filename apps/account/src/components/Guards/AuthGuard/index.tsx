import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLocalStorageState from 'use-local-storage-state'

import { AuthData } from '../../../types/auth-data'
import { ApiWrapper } from '../../../libs/services/api-wrapper'
import useApiRequest from '../../../libs/hooks/useApiRequest'
import { useInfoMessages } from '../../../states/application/hook'
import { AUTH_DATA_KEY } from '../../../constants'

interface AuthGuardProps {
  element: React.ReactElement
}

const AuthGuard: React.FC<AuthGuardProps> = (props) => {
  const [shouldRender, setShouldRender] = useState<boolean>(false)

  const navigate = useNavigate()
  const { hash } = useLocation()
  const [, , { removeItem: removeAuthData }] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)

  const { process: sendPing } = useApiRequest()
  const { clearInfoMessage } = useInfoMessages()

  const logoutHandler = useCallback(() => {
    setShouldRender(false)

    clearInfoMessage()
    removeAuthData()
    navigate(`/${hash}`)
  }, [hash, clearInfoMessage, navigate, removeAuthData])

  useEffect(() => {
    const ping = async () => {
      try {
        await sendPing(ApiWrapper.instance.pingRequest())
        setShouldRender(true)
      } catch {
        logoutHandler()
      }
    }

    ping()
  }, [logoutHandler, sendPing])

  return <>{shouldRender && props.element}</>
}

export default AuthGuard
