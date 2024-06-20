import { initAppConfig } from '@repo/common/dist/src/app-config'

export function createAppConfig() {
  if (!process.env.RANGO_API_KEY) {
    throw new Error('RANGO_API_KEY is not set')
  }

  if (!process.env.RANGO_API_KEY_SWAP) {
    throw new Error('RANGO_API_KEY_SWAP is not set')
  }

  if (!process.env.JWT_ENCRYPTION_KEY) {
    throw new Error('JWT_ENCRYPTION_KEY is not set')
  }

  if (!process.env.JWT_INIT_VECTOR) {
    throw new Error('JWT_INIT_VECTOR is not set')
  }

  if (!process.env.EMAIL_CONFIG) {
    throw new Error('EMAIL_CONFIG is not set')
  }

  if (!process.env.BITCOIN_RPC) {
    throw new Error('BITCOIN_RPC is not set')
  }

  if (!process.env.BITCOIN_FEE_RPC) {
    throw new Error('BITCOIN_FEE_RPC is not set')
  }

  if (!process.env.EXCHANGERATE_API_KEY) {
    throw new Error('EXCHANGERATE_API_KEY is not set')
  }

  if (!process.env.SEED_BTC_WALLET_FROM) {
    throw new Error('SEED_BTC_WALLET_FROM is not set')
  }

  if (!process.env.TABLE_NAME) {
    throw new Error('TABLE_NAME is not set')
  }

  const NODE_ENV = process.env.NODE_ENV ?? 'local'

  initAppConfig({
    NODE_ENV,
    IS_DEV: process.env.IS_DEV ?? 'false',
    RANGO_API_KEY: process.env.RANGO_API_KEY,
    RANGO_API_KEY_SWAP: process.env.RANGO_API_KEY_SWAP,
    JWT_ENCRYPTION_KEY: process.env.JWT_ENCRYPTION_KEY,
    JWT_INIT_VECTOR: process.env.JWT_INIT_VECTOR,
    EMAIL_CONFIG: process.env.EMAIL_CONFIG,
    BITCOIN_RPC: process.env.BITCOIN_RPC,
    BITCOIN_FEE_RPC: process.env.BITCOIN_FEE_RPC,
    EXCHANGERATE_API_KEY: process.env.EXCHANGERATE_API_KEY,
    SEED_BTC_WALLET_FROM: process.env.SEED_BTC_WALLET_FROM,
    TABLE_NAME: process.env.TABLE_NAME
  })
}

createAppConfig()
