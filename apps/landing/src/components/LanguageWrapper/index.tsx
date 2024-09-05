import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import i18n from 'i18next'

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../constants'

interface LanguageWrapperProps {
  element: React.ReactElement
}

const LanguageWrapper: React.FC<LanguageWrapperProps> = (props) => {
  const { element } = props

  const { lang } = useParams<{ lang?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

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
  }, [lang, navigate, location])

  return <>{element}</>
}

export default LanguageWrapper
