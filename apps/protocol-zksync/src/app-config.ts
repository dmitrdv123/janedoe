import { initAppConfig } from '@repo/common/dist/src/app-config'

export function createAppConfig() {
  const NODE_ENV = process.env.NODE_ENV ?? 'local'

  if (!process.env.RANGO_API_KEY) {
    throw new Error('RANGO_API_KEY is not set')
  }

  initAppConfig({
    NODE_ENV,
    IS_DEV: process.env.IS_DEV ?? 'false',
    RANGO_API_KEY: process.env.RANGO_API_KEY
  })
}

createAppConfig()
