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

  if (!process.env.BITCOIN_NETWORK) {
    throw new Error('BITCOIN_NETWORK is not set')
  }

  if (!process.env.BITCOIN_DEFAULT_FEE_RATE) {
    throw new Error('BITCOIN_DEFAULT_FEE_RATE is not set')
  }

  if (!process.env.PORT) {
    throw new Error('PORT is not set')
  }

  if (!process.env.APP_NAME) {
    throw new Error('APP_NAME is not set')
  }

  if (!process.env.APP_URL) {
    throw new Error('APP_URL is not set')
  }

  if (!process.env.PAYMENT_URL) {
    throw new Error('PAYMENT_URL is not set')
  }

  if (!process.env.SUPPORT_URL) {
    throw new Error('SUPPORT_URL is not set')
  }

  if (!process.env.PINO_CONFIG) {
    throw new Error('PINO_CONFIG is not set')
  }

  if (!process.env.TABLE_NAME) {
    throw new Error('TABLE_NAME is not set')
  }

  if (!process.env.TABLE_NAME_TIME_SERIES) {
    throw new Error('TABLE_NAME_TIME_SERIES is not set')
  }

  if (!process.env.BUCKET_NAME_DATA) {
    throw new Error('BUCKET_NAME_DATA is not set')
  }

  if (!process.env.PAYMENT_NOTIFICATION_FROM_EMAIL) {
    throw new Error('PAYMENT_NOTIFICATION_FROM_EMAIL is not set')
  }

  if (!process.env.SUPPORT_NOTIFICATION_TO_EMAIL) {
    throw new Error('SUPPORT_NOTIFICATION_TO_EMAIL is not set')
  }

  if (!process.env.METRIC_RANGO_NAMESPACE) {
    throw new Error('METRIC_RANGO_NAMESPACE is not set')
  }

  if (!process.env.METRIC_RANGO_NAME) {
    throw new Error('METRIC_RANGO_NAME is not set')
  }

  if (!process.env.METRIC_RANGO_CONVERSION_NAMESPACE) {
    throw new Error('METRIC_RANGO_CONVERSION_NAMESPACE is not set')
  }

  if (!process.env.METRIC_RANGO_CONVERSION_NAME) {
    throw new Error('METRIC_RANGO_CONVERSION_NAME is not set')
  }

  if (!process.env.METRIC_BITCOIN_NAMESPACE) {
    throw new Error('METRIC_BITCOIN_NAMESPACE is not set')
  }

  if (!process.env.METRIC_BITCOIN_NAME) {
    throw new Error('METRIC_BITCOIN_NAME is not set')
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
    PORT: process.env.PORT,
    BITCOIN_NETWORK: process.env.BITCOIN_NETWORK,
    BITCOIN_DEFAULT_FEE_RATE: process.env.BITCOIN_DEFAULT_FEE_RATE,
    APP_NAME: process.env.APP_NAME,
    APP_URL: process.env.APP_URL,
    PAYMENT_URL: process.env.PAYMENT_URL,
    SUPPORT_URL: process.env.SUPPORT_URL,
    PINO_CONFIG: process.env.PINO_CONFIG,
    TABLE_NAME: process.env.TABLE_NAME,
    TABLE_NAME_TIME_SERIES: process.env.TABLE_NAME_TIME_SERIES,
    BUCKET_NAME_DATA: process.env.BUCKET_NAME_DATA,
    PAYMENT_NOTIFICATION_FROM_EMAIL: process.env.PAYMENT_NOTIFICATION_FROM_EMAIL,
    SUPPORT_NOTIFICATION_TO_EMAIL: process.env.SUPPORT_NOTIFICATION_TO_EMAIL,
    METRIC_RANGO_NAMESPACE: process.env.METRIC_RANGO_NAMESPACE,
    METRIC_RANGO_NAME: process.env.METRIC_RANGO_NAME,
    METRIC_RANGO_CONVERSION_NAMESPACE: process.env.METRIC_RANGO_CONVERSION_NAMESPACE,
    METRIC_RANGO_CONVERSION_NAME: process.env.METRIC_RANGO_CONVERSION_NAME,
    METRIC_BITCOIN_NAMESPACE: process.env.METRIC_BITCOIN_NAMESPACE,
    METRIC_BITCOIN_NAME: process.env.METRIC_BITCOIN_NAME
  })
}

createAppConfig()
