import { Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import useNavigationPath from '../../libs/hooks/useNavigationPath'

const Tutorials: React.FC = () => {
  const { t } = useTranslation()
  const getNavigationPath = useNavigationPath()

  return (
    <>
      <h1 className="mb-3">
        {t('components.tutorials.title')}
      </h1>

      <Nav className="flex-column">
        <Nav.Link as={Link} to={getNavigationPath('tutorials_create_account')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_create_account')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_receive_payments')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_receive_payments')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_monitor_payments')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_monitor_payments')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_withdraw')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_withdraw')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_share_access')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_share_access')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_payment_settings')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_payment_settings')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_notifications')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_notifications')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('tutorials_api')} className="ps-0">
          <span className="ms-4">{t('pages.app.tutorials_api')}</span>
        </Nav.Link>
      </Nav>
    </>
  )
}

export default Tutorials
