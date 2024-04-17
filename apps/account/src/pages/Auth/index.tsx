import React, { useCallback, useEffect } from 'react'
import { Alert, Button, Container, Form, Spinner, Row, Col } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAccount, useWalletClient } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import useLocalStorageState from 'use-local-storage-state'
import { useLocation, useNavigate } from 'react-router-dom'

import './index.css'

import { useInfoMessages } from '../../states/application/hook'
import { authDataKey, convertErrorToMessage } from '../../libs/utils'
import { INFO_MESSAGE_AUTH_ERROR } from '../../constants'
import { AuthData } from '../../types/auth-data'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { AccountNonce } from '../../types/account-nonce'
import AuthNavbar from '../../components/navbars/AuthNavbar'

const Auth: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { address, isConnected } = useAccount()
  const { data: signer } = useWalletClient()
  const { open } = useWeb3Modal()

  const { infoMessages, addInfoMessage, removeInfoMessage } = useInfoMessages()
  const [authData, setAuthData, { removeItem: removeAuthData }] = useLocalStorageState<AuthData>(authDataKey())
  const { status: retrieveNonceStatus, process: retrieveNonce } = useApiRequest<AccountNonce>()
  const { status: authStatus, process: auth } = useApiRequest<AuthData>()

  useEffect(() => {
    if (authData) {
      navigate(`/accounts/${hash}`)
    }
  }, [authData, hash, navigate])

  const getInfoMessages = useCallback(() => {
    return [...infoMessages]
      .reverse()
      .map(item => {
        return (
          <Alert
            key={item.key}
            variant={item.variant ?? 'info'}
            onClose={() => removeInfoMessage(item.key)}
            dismissible
          >
            {item.content}
          </Alert>
        )
      })
  }, [infoMessages, removeInfoMessage])

  const connectHandler = useCallback(async () => {
    try {
      removeInfoMessage(INFO_MESSAGE_AUTH_ERROR)
      await open()
    } catch (error) {
      addInfoMessage(convertErrorToMessage(error), INFO_MESSAGE_AUTH_ERROR, 'danger')
    }
  }, [addInfoMessage, open, removeInfoMessage])

  const authHandler = useCallback(async () => {
    try {
      removeInfoMessage(INFO_MESSAGE_AUTH_ERROR)

      if (!!address && !!signer) {
        const accountNonce = await retrieveNonce(ApiWrapper.instance.retrieveNonceRequest(address?.toString()))
        if (!accountNonce) {
          addInfoMessage(
            t('pages.auth.errors.nonce_not_defined'),
            INFO_MESSAGE_AUTH_ERROR,
            'danger'
          )
          return
        }

        const signature = await signer?.signMessage({
          message: `I am signing my one-time nonce: ${accountNonce.nonce}`
        })
        const authData = await auth(ApiWrapper.instance.authRequest(accountNonce.nonceId, address, signature))
        setAuthData(authData)

        navigate(`/accounts/${hash}`)
      }
    } catch (error) {
      removeAuthData()
      addInfoMessage(
        t('pages.auth.errors.fail_retrieve_nonce'),
        INFO_MESSAGE_AUTH_ERROR,
        'danger'
      )
    }
  }, [t, address, signer, hash, auth, navigate, removeAuthData, addInfoMessage, removeInfoMessage, retrieveNonce, setAuthData])

  return (
    <div className="d-flex flex-column min-vh-100">
      <AuthNavbar />

      {getInfoMessages()}

      <main className="flex-grow-1 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={8} md={6} lg={4}>
              <Form className="form-signin w-100 m-auto">
                <h1 className='mb-3 text-center'>
                  {import.meta.env.VITE_APP_APP_NAME ?? 'Jane Doe'}
                </h1>

                {!isConnected && (
                  <Button variant="primary" className="btn-lg w-100" onClick={connectHandler} disabled={retrieveNonceStatus === 'processing' || authStatus === 'processing'}>
                    {t('pages.auth.connect')}
                    {(retrieveNonceStatus === 'processing' || authStatus === 'processing') && (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                        <span className="visually-hidden">{t('common.processing')}</span>
                      </Spinner>
                    )}
                  </Button>
                )}

                {isConnected && (
                  <Button variant="primary" className="btn-lg w-100" onClick={authHandler} disabled={retrieveNonceStatus === 'processing' || authStatus === 'processing'}>
                    {t('pages.auth.button')}
                    {(retrieveNonceStatus === 'processing' || authStatus === 'processing') && (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                        <span className="visually-hidden">{t('common.processing')}</span>
                      </Spinner>
                    )}
                  </Button>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  )
}

export default Auth
