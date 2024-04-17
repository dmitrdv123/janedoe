import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../constants'

interface AccountNavbarProps {
}

const AccountNavbar: React.FC<AccountNavbarProps> = () => {
  const { t, i18n } = useTranslation()

  return (
    <Navbar className="bg-body-tertiary" sticky='top'>
      <Container fluid className="d-flex justify-content-end">
        <Nav>
          <NavDropdown
            title={t('components.doc_navbar.language', { language: i18n.resolvedLanguage?.toLocaleUpperCase() ?? 'EN' })}
            align='end'
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <NavDropdown.Item
                as='button'
                key={lang}
                active={lang === (i18n.resolvedLanguage ?? 'EN')}
                onClick={() => i18n.changeLanguage(lang)}
              >
                {lang.toLocaleUpperCase()}
              </NavDropdown.Item>
            ))}
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  )
}

export default AccountNavbar
