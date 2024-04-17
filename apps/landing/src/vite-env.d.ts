/// <reference types="vite/client" />
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_IS_DEV: boolean
  readonly VITE_APP_APP_NAME: string
  readonly VITE_APP_APP_PREFIX: string
  readonly VITE_PORT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
