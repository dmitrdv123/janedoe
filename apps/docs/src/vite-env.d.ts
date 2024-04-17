/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_IS_DEV: boolean
  readonly VITE_PORT: number
  readonly VITE_APP_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
