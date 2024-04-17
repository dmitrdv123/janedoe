const appConfig: { [key: string]: string } = {}

export function initAppConfig(config: { [key: string]: string }) {
  Object.entries(config).forEach(([key, value]) => {
    appConfig[key] = value
  })
}

export default appConfig
