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
              <NavDropdown.Item href="#contacts">
                {t('components.navbar.contacts')}
              </NavDropdown.Item>
              <NavDropdown.Item href="https://medium.com/@boss_1691" target='_blank'>
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
