import { ApiRequest } from '../../types/api-request'
import { ServiceError } from '../../types/service-error'
import { SupportTicket } from '../../types/support-ticket'

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

  public submitSupportTicket(ticket: SupportTicket): ApiRequest {
    return {
      url: this.getSupportTicketUrl(),
      method: 'POST',
      body: JSON.stringify(ticket)
    }
  }

  private getSupportTicketUrl(): string {
    return `{baseUrlApi}/api/payment/support/{id}`
  }
}
