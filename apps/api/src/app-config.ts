import { initAppConfig } from '@repo/common/dist/src/app-config'

export function createAppConfig() {
  if (!process.env.RANGO_API_KEY) {
    throw new Error('RANGO_API_KEY is not set')
  }

  if (!process.env.PORT) {
    throw new Error('PORT is not set')
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

  if (!process.env.APP_NAME) {
    throw new Error('APP_NAME is not set')
  }

  if (!process.env.APP_URL) {
    throw new Error('APP_URL is not set')
  }

  if (!process.env.STATUS_PAGE_URL) {
    throw new Error('STATUS_PAGE_URL is not set')
  }

  if (!process.env.SUPPORT_URL) {
    throw new Error('SUPPORT_URL is not set')
  }

  if (!process.env.BITCOIN_RPC) {
    throw new Error('BITCOIN_RPC is not set')
  }

  if (!process.env.BITCOIN_CENTRAL_WALLET) {
    throw new Error('BITCOIN_CENTRAL_WALLET is not set')
  }

  if (!process.env.EXCHANGERATE_API_KEY) {
    throw new Error('EXCHANGERATE_API_KEY is not set')
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

  if (!process.env.TABLE_NAME_NOTIFICATION) {
    throw new Error('TABLE_NAME_NOTIFICATION is not set')
  }

  if (!process.env.BUCKET_NAME_DATA) {
    throw new Error('BUCKET_NAME_DATA is not set')
  }

  const NODE_ENV = process.env.NODE_ENV ?? 'local'

  initAppConfig({
    NODE_ENV,
    IS_DEV: process.env.IS_DEV ?? 'false',
    RANGO_API_KEY: process.env.RANGO_API_KEY,
    PORT: process.env.PORT,
    JWT_ENCRYPTION_KEY: process.env.JWT_ENCRYPTION_KEY,
    JWT_INIT_VECTOR: process.env.JWT_INIT_VECTOR,
    EMAIL_CONFIG: process.env.EMAIL_CONFIG,
    APP_NAME: process.env.APP_NAME,
    APP_URL: process.env.APP_URL,
    STATUS_PAGE_URL: process.env.STATUS_PAGE_URL,
    SUPPORT_URL: process.env.SUPPORT_URL,
    EXCHANGERATE_API_KEY: process.env.EXCHANGERATE_API_KEY,
    PINO_CONFIG: process.env.PINO_CONFIG,
    BITCOIN_RPC: process.env.BITCOIN_RPC,
    BITCOIN_CENTRAL_WALLET: process.env.BITCOIN_CENTRAL_WALLET,
    TABLE_NAME: process.env.TABLE_NAME,
    TABLE_NAME_TIME_SERIES: process.env.TABLE_NAME_TIME_SERIES,
    TABLE_NAME_NOTIFICATION: process.env.TABLE_NAME_NOTIFICATION,
    BUCKET_NAME_DATA: process.env.BUCKET_NAME_DATA,
  })
}

createAppConfig()
