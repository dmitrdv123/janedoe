import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Col, Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Envelope, House, Gear, FileText, CurrencyDollar, Wallet, CreditCard, CardList } from 'react-bootstrap-icons'

import './index.css'

import SettingsLoader from '../../states/settings/loader'
import MetaUpdater from '../../states/meta/updater'
import PaymentSettingsLoader from '../../states/account-settings/loader'
import ExchangeRateUpdater from '../../states/exchange-rate/updater'
import RbacGuard from '../../components/Guards/RbacGuard'
import AppNavbar from '../../components/navbars/AppNavbar'
import { useConfig } from '../../context/config/hook'
import InfoMessages from '../../components/InfoMessages'
import { ApplicationPage } from '../../types/page'
import { Permission, PermissionKey } from '../../types/account-settings'

interface AppProps {
  page: ApplicationPage
  requiredKeys?: PermissionKey[] | undefined
  requiredPermission?: Permission | undefined
  element: React.ReactElement
}

const App: React.FC<AppProps> = (props) => {
  const { page, requiredKeys, requiredPermission, element } = props

  const { t } = useTranslation()
  const { id } = useParams()

  const config = useConfig()

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

          <Nav defaultActiveKey={`/app/${id ?? ''}`} className="nav-pills flex-column mb-auto w-100">
            <Nav.Link as={Link} to={`/app/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.HOME}>
              <House />
              <span className="ms-3 d-none d-sm-inline">{t('pages.app.home')}</span>
            </Nav.Link>

            <RbacGuard requiredKeys={['balances']} requiredPermission='View' element={
              <Nav.Link as={Link} to={`/balances/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.BALANCES}>
                <CurrencyDollar />
                <span className="ms-3 d-none d-sm-inline">{t('pages.app.balances')}</span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['balances']} requiredPermission='Modify' element={
              <Nav.Link as={Link} to={`/payment/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.PAYMENT}>
                <CreditCard />
                <span className="ms-3 d-none d-sm-inline">{t('pages.app.payment')}</span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['payments']} requiredPermission='View' element={
              <Nav.Link as={Link} to={`/payments/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.PAYMENTS}>
                <CardList />
                <span className="ms-3 d-none d-sm-inline">{t('pages.app.payments')}</span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings', 'payment_settings']} requiredPermission='View' element={
              <Nav.Item className="text-white text-decoration-none">
                <hr />
              </Nav.Item>
            } />

            <RbacGuard requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings']} requiredPermission='View' element={
              <Nav.Link as={Link} to={`/account_settings/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.ACCOUNT_SETTINGS}>
                <Gear />
                <span className="ms-3 d-none d-sm-inline">
                  {t('pages.app.account_settings')}
                </span>
              </Nav.Link>
            } />

            <RbacGuard requiredKeys={['payment_settings']} requiredPermission='View' element={
              <Nav.Link as={Link} to={`/payment_settings/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.PAYMENT_SETTINGS}>
                <Wallet />
                <span className="ms-3 d-none d-sm-inline">
                  {t('pages.app.payment_settings')}
                </span>
              </Nav.Link>
            } />

            <Nav.Item className="text-white text-decoration-none">
              <hr />
            </Nav.Item>

            <Nav.Link as={Link} to={`/support/${id ?? ''}`} className="text-white text-decoration-none" active={page === ApplicationPage.SUPPORT}>
              <Envelope />
              <span className="ms-3 d-none d-sm-inline">
                {t('pages.app.support')}
              </span>
            </Nav.Link>

            <Nav.Link href={config.config?.baseUrlDocs} className="text-white text-decoration-none" target='_blank'>
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
            {(!!requiredKeys && !!requiredPermission) && (
              <RbacGuard requiredKeys={requiredKeys} requiredPermission={requiredPermission} element={element} />
            )}

            {(!requiredKeys && !requiredPermission) && (element)}
          </Container>
        </Col>
      </main>
    </>
  )
}

export default App
