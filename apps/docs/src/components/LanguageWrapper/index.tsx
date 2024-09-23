import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../constants'
import { useConfig } from '../../context/config/hook'

interface LanguageWrapperProps {
  element: React.ReactElement
}

const LanguageWrapper: React.FC<LanguageWrapperProps> = (props) => {
  const { element } = props

  const { lang } = useParams<{ lang?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()
  const config = useConfig()

  useEffect(() => {
    const detectedLanguage = SUPPORTED_LANGUAGES.includes(i18n.language) ? i18n.language : DEFAULT_LANGUAGE
    const processedLang = lang?.toLocaleLowerCase()

    if (!processedLang) {
      navigate(`/${detectedLanguage}${location.pathname}`, { replace: true })
    } else if (!SUPPORTED_LANGUAGES.includes(processedLang)) {
      const pathWithoutLang = location.pathname.slice(processedLang.length + 1)
      navigate(`/${detectedLanguage}${pathWithoutLang}`, { replace: true })
    } else if (processedLang !== i18n.language) {
      i18n.changeLanguage(processedLang)
    }
  }, [i18n, lang, location, navigate])

  return (
    <>
      <Helmet>
        {(!!config.config && !!lang && lang.toLocaleLowerCase() === DEFAULT_LANGUAGE) && (
          <link rel="canonical" href={`${config.config?.baseUrlDocs}${location.pathname.slice(lang.length + 1)}${location.pathname.endsWith('/') ? '' : '/'}${location.hash}`} />
        )}

        {(!!config.config && (!lang || lang.toLocaleLowerCase() !== DEFAULT_LANGUAGE)) && (
          <link rel="canonical" href={`${config.config?.baseUrlDocs}${location.pathname}${location.pathname.endsWith('/') ? '' : '/'}${location.hash}`} />
        )}
      </Helmet>
      {element}
    </>
  )
}

export default LanguageWrapper
