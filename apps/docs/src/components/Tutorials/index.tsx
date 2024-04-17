import { Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const Tutorials: React.FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.title')}
      </h1>

      <Nav className="flex-column">
        <Nav.Link href="#tutorials_create_account" className="ps-0">
          {t('pages.app.tutorials_create_account')}
        </Nav.Link>
        <Nav.Link href="#tutorials_receive_payments" className="ps-0">
          {t('pages.app.tutorials_receive_payments')}
        </Nav.Link>
        <Nav.Link href="#tutorials_monitor_payments" className="ps-0">
          {t('pages.app.tutorials_monitor_payments')}
        </Nav.Link>
        <Nav.Link href="#tutorials_withdraw" className="ps-0">
          {t('pages.app.tutorials_withdraw')}
        </Nav.Link>
        <Nav.Link href="#tutorials_share_access" className="ps-0">
          {t('pages.app.tutorials_share_access')}
        </Nav.Link>
        <Nav.Link href="#tutorials_payment_settings" className="ps-0">
          {t('pages.app.tutorials_payment_settings')}
        </Nav.Link>
        <Nav.Link href="#tutorials_notifications" className="ps-0">
          {t('pages.app.tutorials_notifications')}
        </Nav.Link>
        <Nav.Link href="#tutorials_api" className="ps-0">
          {t('pages.app.tutorials_api')}
        </Nav.Link>
      </Nav>
    </>
  )
}

export default Tutorials
