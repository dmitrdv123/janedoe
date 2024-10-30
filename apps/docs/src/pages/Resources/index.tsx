import { Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import useNavigationPath from '../../libs/hooks/useNavigationPath'


const Resources: React.FC = () => {
  const { t } = useTranslation()
  const getNavigationPath = useNavigationPath()

  return (
    <>
      <h1 className="mb-3">
        {t('components.resources.title')}
      </h1>

      <Nav className="flex-column">
        <Nav.Link as={Link} to={getNavigationPath('resources_currencies')} className="ps-0">
          <span className="ms-4">{t('pages.app.resources_currencies')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('resources_blockchains')} className="ps-0">
          <span className="ms-4">{t('pages.app.resources_blockchains')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('resources_tokens')} className="ps-0">
          <span className="ms-4">{t('pages.app.resources_tokens')}</span>
        </Nav.Link>
        <Nav.Link as={Link} to={getNavigationPath('resources_contracts')} className="ps-0">
          <span className="ms-4">{t('pages.app.resources_contracts')}</span>
        </Nav.Link>
      </Nav>
    </>
  )
}

export default Resources
