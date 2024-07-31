import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLocalStorageState from 'use-local-storage-state'
import { Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { AuthData } from '../../../types/auth-data'
import { ApiWrapper } from '../../../libs/services/api-wrapper'
import useApiRequest from '../../../libs/hooks/useApiRequest'
import { useAccount, useDisconnect } from 'wagmi'
import { useInfoMessages } from '../../../states/application/hook'
import { AUTH_DATA_KEY } from '../../../constants'

interface AuthGuardProps {
  element: React.ReactElement
}

const AuthGuard: React.FC<AuthGuardProps> = (props) => {
  const [shouldRender, setShouldRender] = useState<boolean>(false)
  const [prevAddress, setPrevAddress] = useState<string | undefined>(undefined)

  const navigate = useNavigate()
  const { hash } = useLocation()
  const [, , { removeItem: removeAuthData }] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)
  const { address, status: connectStatus } = useAccount()
  const { disconnect } = useDisconnect()
  const { t } = useTranslation()

  const { process: sendPing } = useApiRequest()
  const { clearInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (connectStatus === 'connected' && address) {
      setPrevAddress(address)
    } else {
      setPrevAddress(undefined)
    }
  }, [connectStatus, address])

  useEffect(() => {
    if (prevAddress && address && prevAddress !== address) {
      disconnect()
    }
  }, [address, prevAddress, disconnect])

  useEffect(() => {
    const ping = async () => {
      try {
        await sendPing(ApiWrapper.instance.pingRequest())
        setShouldRender(true)
      } catch {
        setShouldRender(false)
        removeAuthData()
        clearInfoMessage()

        navigate(`/${hash}`)
      }
    }

    if (connectStatus === 'connected') {
      ping()
    } else if (connectStatus === 'disconnected') {
      setShouldRender(false)
      removeAuthData()
      clearInfoMessage()

      navigate(`/${hash}`)
    }
  }, [hash, connectStatus, clearInfoMessage, sendPing, removeAuthData, navigate])

  return (
    <>
      {!shouldRender && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
          <span className="visually-hidden">{t('common.saving')}</span>
        </Spinner>
      )}

      {shouldRender && props.element}
    </>
  )
}

export default AuthGuard
