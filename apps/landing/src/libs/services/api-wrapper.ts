import { ApiRequest } from '../../types/api-request'
import { ServiceError } from '../../types/errors/service-error'

export class ApiWrapper {
  private static _instance: ApiWrapper;

  private constructor() { }

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

    const result = await response.json()
    if (!response.ok) {
      if (result.code && result.message) {
        throw new ServiceError(result.message, result.code)
      }

      throw new ServiceError('Failed to send request', 'services.errors.request_error')
    }

    return result
  }

  public static get instance(): ApiWrapper {
    if (!ApiWrapper._instance) {
      ApiWrapper._instance = new ApiWrapper();
    }

    return ApiWrapper._instance;
  }

  public latestArticle(): ApiRequest {
    return {
      url: this.getLatestArticleUrl()
    }
  }

  public articles(timestamp?: number | undefined): ApiRequest {
    return {
      url: this.getArticlesUrl(timestamp)
    }
  }

  private getLatestArticleUrl(): string {
    return '{baseUrlApi}/api/landing/article/latest'
  }

  private getArticlesUrl(timestamp?: number | undefined): string {
    return timestamp === undefined
      ? '{baseUrlApi}/api/landing/articles'
      : `{baseUrlApi}/api/landing/articles/${timestamp}`
  }
}
