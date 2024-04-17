import { ApiRequest } from '../../types/api-request'
import { ServiceError } from '../../types/service-error'

export class ApiWrapper {
  private static _instance: ApiWrapper;

  private constructor() { }

  public static get instance(): ApiWrapper {
    if (!ApiWrapper._instance) {
      ApiWrapper._instance = new ApiWrapper();
    }

    return ApiWrapper._instance;
  }

  public async send<T>(request: ApiRequest): Promise<T> {
    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const response = await fetch(request.url, {
      headers,
      method: request.method,
      body: request.body
    })

    if (!response.ok) {
      throw new ServiceError('Failed to send request', 'services.errors.request_error')
    }

    return await response.json()
  }

  public settingsRequest(): ApiRequest {
    return {
      url: this.getSettingsUrl(),
    }
  }

  private getSettingsUrl(): string {
    return `{baseUrlApi}/api/doc/settings`
  }

  public metaRequest(): ApiRequest {
    return {
      url: this.getMetaUrl()
    }
  }

  private getMetaUrl(): string {
    return `{baseUrlApi}/api/doc/meta`
  }
}
