import { initAppConfig } from '@repo/common/dist/src/app-config'

export function createAppConfig() {
  if (!process.env.SECRETS) {
    throw new Error('SECRETS is not set')
  }

  const {
    RANGO_API_KEY,
    RANGO_API_KEY_SWAP,
    JWT_ENCRYPTION_KEY,
    JWT_INIT_VECTOR,
    EXCHANGERATE_API_KEY,
    CRYPTO_SEED,
    EMAIL_CONFIG,
    BITCOIN_RPC,
    BITCOIN_FEE_RPC
  } = JSON.parse(process.env.SECRETS)

  if (!RANGO_API_KEY) {
    throw new Error('RANGO_API_KEY is not set')
  }

  if (!RANGO_API_KEY_SWAP) {
    throw new Error('RANGO_API_KEY_SWAP is not set')
  }

  if (!JWT_ENCRYPTION_KEY) {
    throw new Error('JWT_ENCRYPTION_KEY is not set')
  }

  if (!JWT_INIT_VECTOR) {
    throw new Error('JWT_INIT_VECTOR is not set')
  }

  if (!EMAIL_CONFIG) {
    throw new Error('EMAIL_CONFIG is not set')
  }

  if (!EXCHANGERATE_API_KEY) {
    throw new Error('EXCHANGERATE_API_KEY is not set')
  }

  if (!CRYPTO_SEED) {
    throw new Error('CRYPTO_SEED is not set')
  }

  if (!BITCOIN_RPC) {
    throw new Error('BITCOIN_RPC is not set')
  }

  if (!BITCOIN_FEE_RPC) {
    throw new Error('BITCOIN_FEE_RPC is not set')
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
    RANGO_API_KEY,
    RANGO_API_KEY_SWAP,
    JWT_ENCRYPTION_KEY,
    JWT_INIT_VECTOR,
    EMAIL_CONFIG,
    EXCHANGERATE_API_KEY,
    CRYPTO_SEED,
    BITCOIN_RPC,
    BITCOIN_FEE_RPC,
    IS_DEV: process.env.IS_DEV ?? 'false',
    SEED_BTC_WALLET_FROM: process.env.SEED_BTC_WALLET_FROM,
    TABLE_NAME: process.env.TABLE_NAME
  })
}

createAppConfig()
