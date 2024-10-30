import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import ChainedBackend from 'i18next-chained-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'

import { SUPPORTED_LANGUAGES } from '../constants'

i18n
  // load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(ChainedBackend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: 'en',
    debug: import.meta.env.VITE_APP_IS_DEV,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'sessionStorage', 'navigator', 'querystring'],
      lookupFromPathIndex: 0, // Specifies the index in the URL path for language detection
    },
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [],
      cacheHitMode: 'refreshAndUpdateStore',
    },
    interpolation: {
      escapeValue: false, // React already safely escapes values
    },
    react: {
      bindI18nStore: 'added', // this way, when the HttpBackend delivers new translations (thanks to refreshAndUpdateStore), the UI gets updated
    }
  })

export default i18n