import { Container, Nav, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import LanguageDropdown from '../components/LanguageDropdown'
import { useConfig } from '../../../context/config/hook'

const LandingNavbar: React.FC = () => {
  const { t } = useTranslation()
  const config = useConfig()

  return (
    <Navbar expand="sm" sticky='top'>
      <Container fluid>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Nav.Link href={config.config?.baseUrlSupport} target="_blank">
              {t('components.navbar.support')}
            </Nav.Link>
            <Nav.Link href={config.config?.baseUrlDocs} target="_blank">
              {t('components.navbar.documentation')}
            </Nav.Link>
            <LanguageDropdown />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar >
  )
}

export default LandingNavbar
