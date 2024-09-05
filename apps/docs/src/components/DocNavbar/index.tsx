import { useMemo } from 'react'
import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../constants'

const AccountNavbar: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>()
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const routePath = useMemo(() => {
    return lang
      ? `${location.pathname.slice(lang.length + 1)}${location.hash}`
      : `${location.pathname}${location.hash}`
  }, [lang, location.pathname, location.hash])

  return (
    <Navbar className="bg-body-tertiary" sticky='top'>
      <Container fluid className="d-flex justify-content-end">
        <Nav>
          <NavDropdown
            title={t('components.doc_navbar.language', { language: (i18n.language ?? DEFAULT_LANGUAGE).toLocaleUpperCase() })}
            align='end'
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <NavDropdown.Item
                as='a'
                key={lang}
                active={lang === (i18n.language ?? DEFAULT_LANGUAGE)}
                href={`/${lang}${routePath}`}
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
