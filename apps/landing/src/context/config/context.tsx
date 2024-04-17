import React, { useEffect, useState } from 'react'
import { Config, ConfigContext } from './hook'
import { Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface ConfigProviderProps {
  children: React.ReactElement
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const { t } = useTranslation()

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${window.location.origin}/.config.${import.meta.env.VITE_APP_ENV}.json`)
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        const data = await response.json()
        setConfig(data)
      } catch (error) {
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {loading && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      )}

      {(!loading && !!error) && (
        <div>{t('common.errors.default')}</div>
      )}

      {(!loading && !error && !!config) && children}
    </ConfigContext.Provider>
  )
}

export default ConfigProvider
