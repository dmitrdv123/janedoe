import { useMemo } from 'react'
import { NavDropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../../../constants'

const LanguageDropdown: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>()
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const routePath = useMemo(() => {
    return lang
      ? location.pathname.slice(lang.length + 1)
      : location.pathname
  }, [lang, location.pathname])

  return (
    <NavDropdown
      title={t('components.navbar.language', { language:( i18n.language ?? DEFAULT_LANGUAGE).toLocaleUpperCase() })}
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
  )
}

export default LanguageDropdown
