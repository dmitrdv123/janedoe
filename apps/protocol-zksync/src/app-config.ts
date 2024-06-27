import { initAppConfig } from '@repo/common/dist/src/app-config'

export function createAppConfig() {
  const NODE_ENV = process.env.NODE_ENV ?? 'local'

  if (!process.env.SECRETS) {
    throw new Error('SECRETS is not set')
  }

  const {
    RANGO_API_KEY,
    RANGO_API_KEY_SWAP
  } = JSON.parse(process.env.SECRETS)

  if (!RANGO_API_KEY) {
    throw new Error('RANGO_API_KEY is not set')
  }

  if (!RANGO_API_KEY_SWAP) {
    throw new Error('RANGO_API_KEY_SWAP is not set')
  }

  initAppConfig({
    NODE_ENV,
    RANGO_API_KEY,
    RANGO_API_KEY_SWAP,
    IS_DEV: process.env.IS_DEV ?? 'false'
  })
}

createAppConfig()
