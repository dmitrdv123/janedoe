import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

export default function useNavigationPath() {
  const { lang } = useParams<{ lang?: string }>()

  const getNavigationPath = useCallback((path: string) => {
    return lang ? `/${lang}/${path}` : `/${path}`
  }, [lang])

  return getNavigationPath
}
