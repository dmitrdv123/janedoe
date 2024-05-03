import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Col, Container, Nav, Row, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import useLocalStorageState from 'use-local-storage-state'

import './index.css'

import { useInfoMessages } from '../../states/application/hook'
import { authDataKey, convertErrorToMessage } from '../../libs/utils'
import SettingsLoader from '../../states/settings/loader'
import { AuthData } from '../../types/auth-data'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequestImmediate from '../../libs/hooks/useApiRequestImmediate'
import { SharedAccountProfileResponse } from '../../types/account-profile'
import { INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR } from '../../constants'
import AuthNavbar from '../../components/navbars/AuthNavbar'
import InfoMessages from '../../components/InfoMessages'

const Accounts: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const [authData] = useLocalStorageState<AuthData>(authDataKey())

  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const {
    status: sharedAccountsStatus,
    data: sharedAccounts,
    error: sharedAccountsError
  } = useApiRequestImmediate<SharedAccountProfileResponse>(
    ApiWrapper.instance.sharedAccountsRequest()
  )

  useEffect(() => {
    if (sharedAccountsStatus === 'success' && sharedAccounts && sharedAccounts.accounts.length === 0) {
      navigate(`/app/${hash}`)
    }
  }, [sharedAccounts, sharedAccountsStatus, hash, navigate])

  useEffect(() => {
    if (sharedAccountsError) {
      addInfoMessage(convertErrorToMessage(sharedAccountsError, t('common.errors.default')), `${INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR}`, 'danger')
    } else {
      removeInfoMessage(`${INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR}`)
    }
  }, [sharedAccountsError, t, addInfoMessage, removeInfoMessage])

  return (
    <>
      <SettingsLoader />

      <AuthNavbar />

      <main>
        <Container className="p-3">
          <Row className="flex-nowrap">
            <Col>
              <InfoMessages />

              <div className='d-flex'>
                <div className='m-auto'>

                  <h3 className="mb-3">{t('pages.accounts.title')}</h3>

                  <Nav className="flex-column">
                    <Nav.Item>
                      {t('pages.accounts.my_account')}
                    </Nav.Item>
                    <Nav.Link href={`/app/${hash}`}>
                      {authData?.id}
                    </Nav.Link>

                    {(sharedAccountsStatus === 'processing') && (
                      <Nav.Item>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                          <span className="visually-hidden">{t('common.loading')}</span>
                        </Spinner>
                      </Nav.Item>
                    )}

                    {(sharedAccountsStatus === 'error' && sharedAccounts && sharedAccounts.accounts.length === 0) && (
                      <Nav.Item>
                        <Alert variant='warning'>
                          {t('pages.accounts.errors.load_error')}
                        </Alert>
                      </Nav.Item>
                    )}

                    {(sharedAccountsStatus === 'success' && sharedAccounts && sharedAccounts.accounts.length > 0) && (
                      <>
                        <Nav.Item>{t('pages.accounts.shared_account')}</Nav.Item>
                        {
                          sharedAccounts.accounts.map(account => (
                            <Nav.Link key={account.sharedAccountId} href={`/app/${account.sharedAccountId}/${hash}`}>
                              {account.sharedAccountId}
                            </Nav.Link>
                          ))
                        }
                      </>
                    )}
                  </Nav>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}

export default Accounts
