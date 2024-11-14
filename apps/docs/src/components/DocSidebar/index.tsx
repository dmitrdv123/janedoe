import { Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ApplicationPage } from '../../types/page'
import useNavigationPath from '../../libs/hooks/useNavigationPath'

interface DocSidebarProps {
  page: ApplicationPage
}

const DocSidebar: React.FC<DocSidebarProps> = (props) => {
  const { page } = props

  const { t } = useTranslation()

  const getNavigationPath = useNavigationPath()

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" className='d-none d-md-inline'>
        <Container>
          <Navbar.Brand as={Link} to={getNavigationPath('')}>
            <span className='fs-4'>
              {import.meta.env.VITE_APP_APP_NAME ?? 'JaneDoe Finance'}
            </span>
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Navbar bg="dark" data-bs-theme="dark" expand="md" className='d-inline'>
        <Container>
          <Navbar.Toggle aria-controls="sidebar-nav" />
          <Navbar.Collapse id="sidebar-nav">
            <Nav defaultActiveKey={getNavigationPath('')} className="nav-pills flex-column mb-auto w-100">
              <Nav.Link as={Link} to={getNavigationPath('')} className="text-white text-decoration-none" active={page === ApplicationPage.HOME}>
                <span className="ms-2">{t('pages.app.home')}</span>
              </Nav.Link>
              <Nav.Link as={Link} to={getNavigationPath('tutorials')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS}>
                <span className="ms-2">{t('pages.app.tutorials')}</span>
              </Nav.Link>
              <Nav.Item>
                <Nav className="nav-pills flex-column mb-auto w-100 small">
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_create_account')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_CREATE_ACCOUNT}>
                    <span className="ms-4">{t('pages.app.tutorials_create_account')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_receive_payments')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_RECEIVE_PAYMENTS}>
                    <span className="ms-4">{t('pages.app.tutorials_receive_payments')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_monitor_payments')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_MONITOR_PAYMENTS}>
                    <span className="ms-4">{t('pages.app.tutorials_monitor_payments')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_outgoing_payments')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_OUTGOING_PAYMENTS}>
                    <span className="ms-4">{t('pages.app.tutorials_outgoing_payments')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_refund')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_REFUND}>
                    <span className="ms-4">{t('pages.app.tutorials_refund')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_withdraw')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_WITHDRAW}>
                    <span className="ms-4">{t('pages.app.tutorials_withdraw')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_share_access')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_SHARE_ACCESS}>
                    <span className="ms-4">{t('pages.app.tutorials_share_access')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_payment_settings')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_PAYMENT_SETTINGS}>
                    <span className="ms-4">{t('pages.app.tutorials_payment_settings')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_notifications')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_NOTIFICATIONS}>
                    <span className="ms-4">{t('pages.app.tutorials_notifications')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('tutorials_api')} className="text-white text-decoration-none" active={page === ApplicationPage.TUTORIALS_API}>
                    <span className="ms-4">{t('pages.app.tutorials_api')}</span>
                  </Nav.Link>
                </Nav>
              </Nav.Item>
              <Nav.Link as={Link} to={getNavigationPath('resources')} className="text-white text-decoration-none" active={page === ApplicationPage.RESOURCES}>
                <span className="ms-2">{t('pages.app.resources')}</span>
              </Nav.Link>
              <Nav.Item>
                <Nav className="nav-pills flex-column mb-auto w-100 small">
                  <Nav.Link as={Link} to={getNavigationPath('resources_currencies')} className="text-white text-decoration-none" active={page === ApplicationPage.RESOURCES_CURRENCIES}>
                    <span className="ms-4">{t('pages.app.resources_currencies')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('resources_blockchains')} className="text-white text-decoration-none" active={page === ApplicationPage.RESOURCES_BLOCKCHAINS}>
                    <span className="ms-4">{t('pages.app.resources_blockchains')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('resources_tokens')} className="text-white text-decoration-none" active={page === ApplicationPage.RESOURCES_TOKENS}>
                    <span className="ms-4">{t('pages.app.resources_tokens')}</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to={getNavigationPath('resources_contracts')} className="text-white text-decoration-none" active={page === ApplicationPage.RESOURCES_CONTRACTS}>
                    <span className="ms-4">{t('pages.app.resources_contracts')}</span>
                  </Nav.Link>
                </Nav>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default DocSidebar
