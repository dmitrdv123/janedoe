import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Col, Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Envelope, House, Gear, GraphUpArrow, FileText, CurrencyDollar, Wallet } from 'react-bootstrap-icons'

import './index.css'

import { ApplicationPage } from '../../types/page'
import { useCurrentPage, useInfoMessages } from '../../states/application/hook'
import Payments from '../../components/Payments'
import Balances from '../../components/Balances'
import SettingsLoader from '../../states/settings/loader'
import MetaUpdater from '../../states/meta/updater'
import PaymentSettingsLoader from '../../states/account-settings/loader'
import Home from '../../components/Home'
import AccountSettings from '../../components/AccountSettings'
import PaymentSettings from '../../components/PaymentSettings'
import ExchangeRateUpdater from '../../states/exchange-rate/updater'
import RbacGuard from '../../components/Guards/RbacGuard'
import AppNavbar from '../../components/navbars/AppNavbar'
import AccountSupport from '../../components/AccountSupport'
import { useConfig } from '../../context/config/hook'
import InfoMessages from '../../components/InfoMessages'
import { useAccountRbacSettings } from '../../states/account-settings/hook'
import { hasPermission } from '../../libs/utils'
import { PermissionKey } from '../../types/account-settings'

const App: React.FC = () => {
  const { t } = useTranslation()

  const { currentPage, setCurrentPage } = useCurrentPage()
  const { clearInfoMessage } = useInfoMessages()

  const { hash } = useLocation()
  const config = useConfig()
  const rbacSettings = useAccountRbacSettings()

  useEffect(() => {
    clearInfoMessage()

    let page = ApplicationPage.HOME
    let rbacKeys: PermissionKey[] = []
    switch (hash.toLocaleLowerCase()) {
      case '':
      case '#':
      case '#home':
        page = ApplicationPage.HOME
        break
      case '#balances':
        rbacKeys = ['balances']
        page = ApplicationPage.BALANCES
        break
      case '#payments':
        rbacKeys = ['payments']
        page = ApplicationPage.PAYMENTS
        break
      case '#account_settings':
        rbacKeys = ['common_settings', 'notification_settings', 'api_settings', 'team_settings', 'payment_settings']
        page = ApplicationPage.ACCOUNT_SETTINGS
        break
      case '#payment_settings':
        rbacKeys = ['payment_settings']
        page = ApplicationPage.PAYMENT_SETTINGS
        break

      case '#support':
        page = ApplicationPage.SUPPORT
        break
      default:
        page = ApplicationPage.HOME
        break
    }

    if (rbacKeys.length === 0 || hasPermission(rbacSettings, rbacKeys, 'View')) {
      setCurrentPage(page)
    } else {
      setCurrentPage(ApplicationPage.HOME)
    }
  }, [rbacSettings, hash, setCurrentPage, clearInfoMessage])

  return (
    <>
      <SettingsLoader />
      <PaymentSettingsLoader />
      <MetaUpdater />
      <ExchangeRateUpdater />

      <main className="d-flex flex-row">
        <Col lg={2} md={3} sm={4} className="col-auto bg-dark overflow-auto vh-100 p-2">
          <Navbar bg="dark" data-bs-theme="dark" className='d-none d-sm-inline'>
            <Container>
              <Navbar.Brand href="#home">
                <span className='fs-4'>
                  {import.meta.env.VITE_APP_APP_NAME ?? 'JaneDoe Finance'}
                </span>
              </Navbar.Brand>
            </Container>
          </Navbar>

          <Nav defaultActiveKey="#" className="nav-pills flex-column mb-auto w-100">
            <Nav.Link href="#home" className="text-white text-decoration-none" active={currentPage === ApplicationPage.HOME}>
              <House />
              <span className="ms-3 d-none d-sm-inline">{t('pages.app.home')}</span>
            </Nav.Link>

            <RbacGuard requiredKeys={['balances']} requiredPermission='View' element={
              <Nav.Link href="#balances" className="text-white text-decoration-none" active={currentPage === ApplicationPage.BALANCES}>
                <CurrencyDollar />
                <span className="ms-3 d-none d-sm-inline">{t('pages.app.balances')}</span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['payments']} requiredPermission='View' element={
              <Nav.Link href="#payments" className="text-white text-decoration-none" active={currentPage === ApplicationPage.PAYMENTS}>
                <GraphUpArrow />
                <span className="ms-3 d-none d-sm-inline">{t('pages.app.payments')}</span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings', 'payment_settings']} requiredPermission='View' element={
              <Nav.Item className="text-white text-decoration-none">
                <hr />
              </Nav.Item>
            } />

            <RbacGuard requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings']} requiredPermission='View' element={
              <Nav.Link href="#account_settings" className="text-white text-decoration-none" active={currentPage === ApplicationPage.ACCOUNT_SETTINGS}>
                <Gear />
                <span className="ms-3 d-none d-sm-inline">
                  {t('pages.app.account_settings')}
                </span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['payment_settings']} requiredPermission='View' element={
              <Nav.Link href="#payment_settings" className="text-white text-decoration-none" active={currentPage === ApplicationPage.PAYMENT_SETTINGS}>
                <Wallet />
                <span className="ms-3 d-none d-sm-inline">
                  {t('pages.app.payment_settings')}
                </span>
              </Nav.Link>
            } />

            <Nav.Item className="text-white text-decoration-none">
              <hr />
            </Nav.Item>

            <Nav.Link href="#support" className="text-white text-decoration-none" active={currentPage === ApplicationPage.SUPPORT}>
              <Envelope />
              <span className="ms-3 d-none d-sm-inline">
                {t('pages.app.support')}
              </span>
            </Nav.Link>

            <Nav.Link href={config.config?.baseUrlDocs} className="text-white text-decoration-none" target='_blank' active={false}>
              <FileText />
              <span className="ms-3 d-none d-sm-inline">
                {t('pages.app.documentations')}
              </span>
            </Nav.Link>
          </Nav>
        </Col>

        <Col className="overflow-auto vh-100">
          <AppNavbar />

          <Container fluid className="p-3">
            <InfoMessages />

            {currentPage === ApplicationPage.HOME && (
              <Home />
            )}

            <RbacGuard requiredKeys={['balances']} requiredPermission='View' element={
              <>
                {currentPage === ApplicationPage.BALANCES && (
                  <Balances />
                )}
              </>
            } />

            <RbacGuard requiredKeys={['payments']} requiredPermission='View' element={
              <>
                {currentPage === ApplicationPage.PAYMENTS && (
                  <Payments />
                )}
              </>
            } />

            <RbacGuard requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings']} requiredPermission='View' element={
              <>
                {currentPage === ApplicationPage.ACCOUNT_SETTINGS && (
                  <AccountSettings />
                )}
              </>
            } />

            <RbacGuard requiredKeys={['payment_settings']} requiredPermission='View' element={
              <>
                {currentPage === ApplicationPage.PAYMENT_SETTINGS && (
                  <PaymentSettings />
                )}
              </>
            } />

            {currentPage === ApplicationPage.SUPPORT && (
              <AccountSupport />
            )}
          </Container>
        </Col>
      </main>
    </>
  )
}

export default App
