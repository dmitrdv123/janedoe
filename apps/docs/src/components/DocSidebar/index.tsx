import { Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { ApplicationPage } from '../../types/page'
import { useCurrentPage } from '../../states/application/hook'

interface DocSidebarProps {
}

const DocSidebar: React.FC<DocSidebarProps> = () => {
  const { t } = useTranslation()
  const { currentPage } = useCurrentPage()

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" className='d-none d-md-inline'>
        <Container>
          <Navbar.Brand href="#home">
            <span className='fs-4'>
              {import.meta.env.VITE_APP_APP_NAME ?? 'Jane Doe'}
            </span>
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Navbar bg="dark" data-bs-theme="dark" expand="md" className='d-inline'>
        <Container>
          <Navbar.Toggle aria-controls="sidebar-nav" />
          <Navbar.Collapse id="sidebar-nav">
            <Nav defaultActiveKey="#" className="nav-pills flex-column mb-auto w-100">
              <Nav.Link href="#home" className="text-white text-decoration-none" active={currentPage === ApplicationPage.HOME}>
                <span className="ms-2">{t('pages.app.home')}</span>
              </Nav.Link>
              <Nav.Link href="#tutorials" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS}>
                <span className="ms-2">{t('pages.app.tutorials')}</span>
              </Nav.Link>
              <Nav.Item>
                <Nav className="nav-pills flex-column mb-auto w-100 small">
                  <Nav.Link href="#tutorials_create_account" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_CREATE_ACCOUNT}>
                    <span className="ms-4">{t('pages.app.tutorials_create_account')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_receive_payments" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_RECEIVE_PAYMENTS}>
                    <span className="ms-4">{t('pages.app.tutorials_receive_payments')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_monitor_payments" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_MONITOR_PAYMENTS}>
                    <span className="ms-4">{t('pages.app.tutorials_monitor_payments')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_withdraw" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_WITHDRAW}>
                    <span className="ms-4">{t('pages.app.tutorials_withdraw')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_share_access" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_SHARE_ACCESS}>
                    <span className="ms-4">{t('pages.app.tutorials_share_access')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_payment_settings" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_PAYMENT_SETTINGS}>
                    <span className="ms-4">{t('pages.app.tutorials_payment_settings')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_notifications" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_NOTIFICATIONS}>
                    <span className="ms-4">{t('pages.app.tutorials_notifications')}</span>
                  </Nav.Link>
                  <Nav.Link href="#tutorials_api" className="text-white text-decoration-none" active={currentPage === ApplicationPage.TUTORIALS_API}>
                    <span className="ms-4">{t('pages.app.tutorials_api')}</span>
                  </Nav.Link>
                </Nav>
              </Nav.Item>
              <Nav.Link href="#resources" className="text-white text-decoration-none" active={currentPage === ApplicationPage.RESOURCES}>
                <span className="ms-2">{t('pages.app.resources')}</span>
              </Nav.Link>
              <Nav.Item>
                <Nav className="nav-pills flex-column mb-auto w-100 small">
                  <Nav.Link href="#resources_currencies" className="text-white text-decoration-none" active={currentPage === ApplicationPage.RESOURCES_CURRENCIES}>
                    <span className="ms-4">{t('pages.app.resources_currencies')}</span>
                  </Nav.Link>
                  <Nav.Link href="#resources_blockchains" className="text-white text-decoration-none" active={currentPage === ApplicationPage.RESOURCES_BLOCKCHAINS}>
                    <span className="ms-4">{t('pages.app.resources_blockchains')}</span>
                  </Nav.Link>
                  <Nav.Link href="#resources_tokens" className="text-white text-decoration-none" active={currentPage === ApplicationPage.RESOURCES_TOKENS}>
                    <span className="ms-4">{t('pages.app.resources_tokens')}</span>
                  </Nav.Link>
                  <Nav.Link href="#resources_contracts" className="text-white text-decoration-none" active={currentPage === ApplicationPage.RESOURCES_CONTRACTS}>
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
