import { NavDropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { SUPPORTED_LANGUAGES } from '../../../../constants'

const LanguageDropdown: React.FC = () => {
  const { t, i18n } = useTranslation()

  return (
    <NavDropdown
      title={t('components.navbar.language', { language: i18n.resolvedLanguage?.toLocaleUpperCase() ?? 'EN' })}
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
  )
}

export default LanguageDropdown
