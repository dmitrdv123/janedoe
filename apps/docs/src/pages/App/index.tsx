import React, { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert, Col, Container } from 'react-bootstrap'

import './index.css'

import { ApplicationPage } from '../../types/page'
import { useCurrentPage, useInfoMessages } from '../../states/application/hook'
import Home from '../../components/Home'
import DocNavbar from '../../components/DocNavbar'
import DocSidebar from '../../components/DocSidebar'
import Tutorials from '../../components/Tutorials'
import CreateAccount from '../../components/Tutorials/components/CreateAccount'
import ReceivePayments from '../../components/Tutorials/components/ReceivePayments'
import MonitorPayments from '../../components/Tutorials/components/MonitorPayments'
import Withdraw from '../../components/Tutorials/components/Withdraw'
import ShareAccess from '../../components/Tutorials/components/ShareAccess'
import PaymentSettings from '../../components/Tutorials/components/PaymentSettings'
import Notifications from '../../components/Tutorials/components/Notifications'
import Api from '../../components/Tutorials/components/Api'
import Resources from '../../components/Resources'
import Currencies from '../../components/Resources/components/Currencies'
import Blockchains from '../../components/Resources/components/Blockchains'
import Tokens from '../../components/Resources/components/Tokens'
import Contracts from '../../components/Resources/components/Contracts'
import MetaLoader from '../../states/meta/loader'
import SettingsLoader from '../../states/settings/loader'

const App: React.FC = () => {
  const { currentPage, setCurrentPage } = useCurrentPage()

  const { hash } = useLocation()
  const { infoMessages, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    switch (hash.toLocaleLowerCase()) {
      case '':
      case '#':
      case '#home':
        setCurrentPage(ApplicationPage.HOME)
        break

      case '#tutorials':
        setCurrentPage(ApplicationPage.TUTORIALS)
        break
      case '#tutorials_create_account':
        setCurrentPage(ApplicationPage.TUTORIALS_CREATE_ACCOUNT)
        break
      case '#tutorials_receive_payments':
        setCurrentPage(ApplicationPage.TUTORIALS_RECEIVE_PAYMENTS)
        break
      case '#tutorials_monitor_payments':
        setCurrentPage(ApplicationPage.TUTORIALS_MONITOR_PAYMENTS)
        break
      case '#tutorials_withdraw':
        setCurrentPage(ApplicationPage.TUTORIALS_WITHDRAW)
        break
      case '#tutorials_share_access':
        setCurrentPage(ApplicationPage.TUTORIALS_SHARE_ACCESS)
        break
      case '#tutorials_payment_settings':
        setCurrentPage(ApplicationPage.TUTORIALS_PAYMENT_SETTINGS)
        break
      case '#tutorials_notifications':
        setCurrentPage(ApplicationPage.TUTORIALS_NOTIFICATIONS)
        break
      case '#tutorials_api':
        setCurrentPage(ApplicationPage.TUTORIALS_API)
        break

      case '#resources':
        setCurrentPage(ApplicationPage.RESOURCES)
        break
      case '#resources_currencies':
        setCurrentPage(ApplicationPage.RESOURCES_CURRENCIES)
        break
      case '#resources_blockchains':
        setCurrentPage(ApplicationPage.RESOURCES_BLOCKCHAINS)
        break
      case '#resources_tokens':
        setCurrentPage(ApplicationPage.RESOURCES_TOKENS)
        break
      case '#resources_contracts':
        setCurrentPage(ApplicationPage.RESOURCES_CONTRACTS)
        break

      default:
        setCurrentPage(ApplicationPage.HOME)
        break
    }
  }, [hash, setCurrentPage])

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

  return (
    <>
      <SettingsLoader />
      <MetaLoader />

      <main className="d-flex flex-row">
        <Col lg={3} md={4} className="col-auto bg-dark overflow-auto vh-100 p-2">
          <DocSidebar />
        </Col>

        <Col className="overflow-auto vh-100">
          <DocNavbar />

          <Container fluid className="p-3">
            {getInfoMessages()}

            {currentPage === ApplicationPage.HOME && (
              <Home />
            )}

            {currentPage === ApplicationPage.TUTORIALS && (
              <Tutorials />
            )}
            {currentPage === ApplicationPage.TUTORIALS_CREATE_ACCOUNT && (
              <CreateAccount />
            )}
            {currentPage === ApplicationPage.TUTORIALS_RECEIVE_PAYMENTS && (
              <ReceivePayments />
            )}
            {currentPage === ApplicationPage.TUTORIALS_MONITOR_PAYMENTS && (
              <MonitorPayments />
            )}
            {currentPage === ApplicationPage.TUTORIALS_WITHDRAW && (
              <Withdraw />
            )}
            {currentPage === ApplicationPage.TUTORIALS_SHARE_ACCESS && (
              <ShareAccess />
            )}
            {currentPage === ApplicationPage.TUTORIALS_PAYMENT_SETTINGS && (
              <PaymentSettings />
            )}
            {currentPage === ApplicationPage.TUTORIALS_NOTIFICATIONS && (
              <Notifications />
            )}
            {currentPage === ApplicationPage.TUTORIALS_API && (
              <Api />
            )}

            {currentPage === ApplicationPage.RESOURCES && (
              <Resources />
            )}
            {currentPage === ApplicationPage.RESOURCES_CURRENCIES && (
              <Currencies />
            )}
            {currentPage === ApplicationPage.RESOURCES_BLOCKCHAINS && (
              <Blockchains />
            )}
            {currentPage === ApplicationPage.RESOURCES_TOKENS && (
              <Tokens />
            )}
            {currentPage === ApplicationPage.RESOURCES_CONTRACTS && (
              <Contracts />
            )}
          </Container>
        </Col>
      </main>
    </>
  )
}

export default App
