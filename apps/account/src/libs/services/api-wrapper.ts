import { UnathError } from '../../types/unauth-error'
import { AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountTeamSettings } from '../../types/account-settings'
import { ApiRequest } from '../../types/api-request'
import { PaymentLogKey } from '../../types/payment-log'
import { PaymentHistoryFilter } from '../../types/payment-history'
import { ServiceError } from '../../types/service-error'
import { SupportAccountTicket } from '../../types/support-ticket'

export class ApiWrapper {
  private static _instance: ApiWrapper;

  private constructor() { }

  public static get instance(): ApiWrapper {
    if (!ApiWrapper._instance) {
      ApiWrapper._instance = new ApiWrapper();
    }

    return ApiWrapper._instance;
  }

  public async send<T>(request: ApiRequest, accessToken: string | undefined): Promise<T> {
    const headers: HeadersInit = accessToken
      ? {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
      : {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }

    const response = await fetch(request.url, {
      headers,
      method: request.method,
      body: request.body
    })

    if (response.status === 401 || response.status === 403) {
      throw new UnathError()
    }

    if (!response.ok) {
      throw new ServiceError('Failed to send request', 'services.errors.request_error')
    }

    return await response.json()
  }

  public pingRequest(): ApiRequest {
    return {
      url: this.getAccountPingUrl(),
      authRequired: true
    }
  }

  public sharedAccountsRequest(): ApiRequest {
    return {
      url: this.getSharedAccountsUrl(),
      authRequired: true
    }
  }

  public metaRequest(): ApiRequest {
    return {
      url: this.getMetaUrl(),
      authRequired: true
    }
  }

  public exchangeRateRequest(currency: string): ApiRequest {
    return {
      url: this.getExchangeRateUrl(currency),
      authRequired: true
    }
  }

  public exchangeRatesRequest(currency: string, timestamps: number[]): ApiRequest {
    return {
      url: this.getExchangeRateUrl(currency),
      method: 'POST',
      body: JSON.stringify({ timestamps }),
      authRequired: true
    }
  }

  public settingsRequest(): ApiRequest {
    return {
      url: this.getSettingsUrl(),
      authRequired: true
    }
  }

  public accountSettingsRequest(): ApiRequest {
    return {
      url: this.getAccountSettingsUrl(),
      authRequired: true
    }
  }

  public accountDefaultPaymentSettingsRequest(): ApiRequest {
    return {
      url: this.getAccountDefaultPaymentSettingsUrl(),
      authRequired: true
    }
  }

  public saveAccountPaymentSettingsRequest(accountPaymentSettings: AccountPaymentSettings): ApiRequest {
    return {
      url: this.getAccountPaymentSettingsUrlForSave(),
      method: 'POST',
      body: JSON.stringify(accountPaymentSettings),
      authRequired: true
    }
  }

  public saveAccountCommonSettingsRequest(accountCommonSettings: AccountCommonSettings): ApiRequest {
    return {
      url: this.getAccountCommonSettingsUrlForSave(),
      method: 'POST',
      body: JSON.stringify(accountCommonSettings),
      authRequired: true
    }
  }

  public saveAccountNotificationSettingsRequest(accountNotificationSettings: AccountNotificationSettings): ApiRequest {
    return {
      url: this.getAccountNotificationSettingsUrlForSave(),
      method: 'POST',
      body: JSON.stringify(accountNotificationSettings),
      authRequired: true
    }
  }

  public generateAccountApiKeyRequest(): ApiRequest {
    return {
      url: this.getAccountApiKeySettingsUrl(),
      method: 'POST',
      authRequired: true
    }
  }

  public removeAccountApiKeyRequest(): ApiRequest {
    return {
      url: this.getAccountApiKeySettingsUrl(),
      method: 'DELETE',
      authRequired: true
    }
  }

  public saveAccountTeamSettingsRequest(accountTeamSettings: AccountTeamSettings): ApiRequest {
    return {
      url: this.getAccountTeamSettingsUrlForSave(),
      method: 'POST',
      body: JSON.stringify(accountTeamSettings),
      authRequired: true
    }
  }

  public accountBlockchainBalanceRequest(blockchain: string): ApiRequest {
    return {
      url: this.getAccountBlockchainBalanceUrl(blockchain),
      authRequired: true
    }
  }

  public withdrawAccountBlockchainRequest(blockchain: string, address: string): ApiRequest {
    return {
      url: this.getAccountBlockchainWithdrawUrl(blockchain, address),
      method: 'POST',
      authRequired: true
    }
  }

  public accountPaymentHistoryRequest(filter: PaymentHistoryFilter, last: PaymentLogKey | undefined, size: number): ApiRequest {
    return {
      url: this.getAccountPaymentHistoryUrl(),
      method: 'POST',
      body: JSON.stringify(
        {
          filter,
          size,
          last: last ?? null
        }
      ),
      authRequired: true
    }
  }

  public accountPaymentHistoryAsCsvRequest(filter: PaymentHistoryFilter): ApiRequest {
    return {
      url: this.getAccountPaymentHistoryAsCsvUrl(),
      method: 'POST',
      body: JSON.stringify(
        {
          filter
        }
      ),
      authRequired: true
    }
  }

  public sendIpnRequest(paymentId: string, blockchain: string, transaction: string, index: number): ApiRequest {
    return {
      url: this.getSendIpnUrl(),
      method: 'POST',
      body: JSON.stringify({
        paymentId, blockchain, transaction, index
      }),
      authRequired: true
    }
  }

  public submitAccountSupportTicket(ticket: SupportAccountTicket): ApiRequest {
    return {
      url: this.getAccountSupportTicketUrl(),
      method: 'POST',
      body: JSON.stringify(ticket)
    }
  }

  public retrieveNonceRequest(wallet: string): ApiRequest {
    return {
      url: this.getNonceUrl(),
      method: 'POST',
      body: JSON.stringify({ wallet })
    }
  }

  public authRequest(nonceId: string, wallet: string, signature: string): ApiRequest {
    return {
      url: this.getAuthUrl(nonceId),
      method: 'POST',
      body: JSON.stringify({ wallet, signature })
    }
  }

  private getMetaUrl(): string {
    return `{baseUrlApi}/api/account/meta`
  }

  private getExchangeRateUrl(currency: string): string {
    return `{baseUrlApi}/api/account/exchange/${currency}`
  }

  private getAccountPingUrl(): string {
    return `{baseUrlApi}/api/account/ping/{id}`
  }

  private getSharedAccountsUrl(): string {
    return `{baseUrlApi}/api/account/shared`
  }

  private getSettingsUrl(): string {
    return `{baseUrlApi}/api/account/settings`
  }

  private getAccountSettingsUrl(): string {
    return `{baseUrlApi}/api/account/settings/{id}`
  }

  private getAccountPaymentSettingsUrlForSave(): string {
    return `{baseUrlApi}/api/account/settings/payment/{id}`
  }

  private getAccountCommonSettingsUrlForSave(): string {
    return `{baseUrlApi}/api/account/settings/common/{id}`
  }

  private getAccountNotificationSettingsUrlForSave(): string {
    return `{baseUrlApi}/api/account/settings/notification/{id}`
  }

  private getAccountApiKeySettingsUrl(): string {
    return `{baseUrlApi}/api/account/settings/api/{id}`
  }

  private getAccountTeamSettingsUrlForSave(): string {
    return `{baseUrlApi}/api/account/settings/team/{id}`
  }

  private getAccountDefaultPaymentSettingsUrl(): string {
    return `{baseUrlApi}/api/account/settings/payment/default`
  }

  private getAccountBlockchainBalanceUrl(blockchain: string): string {
    return `{baseUrlApi}/api/account/balance/{id}/${blockchain}`
  }

  private getAccountBlockchainWithdrawUrl(blockchain: string, address: string): string {
    return `{baseUrlApi}/api/account/withdraw/{id}/${blockchain}/${address}`
  }

  private getAccountPaymentHistoryUrl(): string {
    return `{baseUrlApi}/api/account/payments/{id}`
  }

  private getAccountPaymentHistoryAsCsvUrl(): string {
    return `{baseUrlApi}/api/account/payments/csv/{id}`
  }

  private getSendIpnUrl(): string {
    return `{baseUrlApi}/api/account/ipn/{id}`
  }

  private getAccountSupportTicketUrl(): string {
    return `{baseUrlApi}/api/account/support/{id}`
  }

  private getNonceUrl(): string {
    return `{baseUrlApi}/api/auth/nonce`
  }

  private getAuthUrl(nonceId: string): string {
    return `{baseUrlApi}/api/auth/${nonceId}`
  }
}
