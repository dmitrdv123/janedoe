import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import LanguageDropdown from '../components/LanguageDropdown'
import { useConfig } from '../../../context/config/hook'

const LandingNavbar: React.FC = () => {
  const { t } = useTranslation()
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

            <NavDropdown title={t('components.navbar.resources')} align='end'>
              <NavDropdown.Item href="#common">
                {t('components.navbar.advantages')}
              </NavDropdown.Item>
              <NavDropdown.Item href="#use_cases">
                {t('components.navbar.use_cases')}
              </NavDropdown.Item>
              <NavDropdown.Item href="#contact_and_links">
                {t('components.navbar.contact_and_links')}
              </NavDropdown.Item>
              <NavDropdown.Item href="/blog">
                {t('components.navbar.blog')}
              </NavDropdown.Item>
            </NavDropdown>

            <LanguageDropdown />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar >
  )
}

export default LandingNavbar
