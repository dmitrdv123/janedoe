import { Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const Resources: React.FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <h1 className="mb-3">
        {t('components.resources.title')}
      </h1>

      <Nav className="flex-column">
        <Nav.Link href="#resources_currencies" className='ps-0' >
          {t('pages.app.resources_currencies')}
        </Nav.Link>
        <Nav.Link href="#resources_blockchains" className='ps-0' >
          {t('pages.app.resources_blockchains')}
        </Nav.Link>
        <Nav.Link href="#resources_tokens" className='ps-0' >
          {t('pages.app.resources_tokens')}
        </Nav.Link>
        <Nav.Link href="#resources_contracts" className='ps-0' >
          {t('pages.app.resources_contracts')}
        </Nav.Link>
      </Nav>
    </>
  )
}

export default Resources
