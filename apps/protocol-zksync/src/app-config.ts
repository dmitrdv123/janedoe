import { initAppConfig } from '@repo/common/dist/src/app-config'

export function createAppConfig() {
  const NODE_ENV = process.env.NODE_ENV ?? 'local'

  initAppConfig({
    NODE_ENV,
    IS_DEV: process.env.IS_DEV ?? 'false',
  })
}
