import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useLocalStorageState from 'use-local-storage-state'

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
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const { process: sendPing } = useApiRequest()
  const { clearInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (isConnected && address) {
      setPrevAddress(address)
    } else {
      setPrevAddress(undefined)
    }
  }, [isConnected, address])

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

    if (isConnected) {
      ping()
    } else {
      setShouldRender(false)
      removeAuthData()
      clearInfoMessage()

      navigate(`/${hash}`)
    }
  }, [isConnected, hash, clearInfoMessage, sendPing, removeAuthData, navigate])

  return <>{shouldRender && props.element}</>
}

export default AuthGuard
