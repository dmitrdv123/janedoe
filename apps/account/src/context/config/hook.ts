import { createContext, useContext } from 'react'

export interface Config {
  baseUrlApi: string
  baseUrlAccount: string
  baseUrlDocs: string
  baseUrlPayment: string
  baseUrlSupport: string
}

interface ConfigContextType {
  config: Config | null
  loading: boolean
  error: Error | null
}

const defaultState: ConfigContextType = {
  config: null,
  loading: true,
  error: null,
}

export const ConfigContext = createContext<ConfigContextType>(defaultState)
export const useConfig = () => useContext(ConfigContext)
