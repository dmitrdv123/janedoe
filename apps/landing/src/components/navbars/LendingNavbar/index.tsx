import { Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import LanguageDropdown from '../components/LanguageDropdown'
import { useConfig } from '../../../context/config/hook'
import { DEFAULT_LANGUAGE } from '../../../constants'

const LandingNavbar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const config = useConfig()

  return (
    <Navbar expand="sm" sticky='top'>
      <Container fluid>
        <Navbar.Brand href="/">
          <span className='fs-4'>
            {import.meta.env.VITE_APP_APP_NAME ?? 'JaneDoe Finance'}
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Nav.Link href={config.config?.baseUrlSupport} target="_blank">
              {t('components.navbar.support')}
            </Nav.Link>
            <Nav.Link href={config.config?.baseUrlDocs} target="_blank">
              {t('components.navbar.documentation')}
            </Nav.Link>
            <Nav.Link href={`/${i18n.language ?? DEFAULT_LANGUAGE}/blog`}>
              {t('components.navbar.blog')}
            </Nav.Link>

            <LanguageDropdown />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar >
  )
}

export default LandingNavbar
