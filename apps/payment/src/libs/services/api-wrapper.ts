import { Asset, BlockchainMeta, assetToString } from 'rango-sdk-basic'

import { ApiRequest } from '../../types/api-request'
import { ServiceError } from '../../types/errors/service-error'

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

    const result = await response.json()
    if (!response.ok) {
      if (result.code && result.message) {
        throw new ServiceError(result.message, result.code)
      }

      throw new ServiceError('Failed to send request', 'services.errors.request_error')
    }

    return result
  }

  public settingsRequest(id: string, paymentId: string, currency: string): ApiRequest {
    return {
      url: this.getSettingsUrl(id, paymentId, currency)
    }
  }

  public walletDetailsRequest(blockchain: BlockchainMeta, address: string): ApiRequest {
    return {
      url: this.getBalancesUrl(blockchain.name, address),
    }
  }

  public quoteRequest(
    sourceContract: string,
    destinationContract: string,
    from: Asset,
    to: Asset,
    amount: string,
    slippage: number
  ): ApiRequest {
    const params = new URLSearchParams({
      sourceContract,
      destinationContract,
      amount,
      from: assetToString(from),
      to: assetToString(to),
      slippage: slippage.toString(),
      contractCall: 'true',
    })

    return {
      url: this.getQuoteUrl(params),
    }
  }

  public swapRequest(
    fromAddress: string,
    toAddress: string,
    sourceContract: string,
    destinationContract: string,
    imMessage: string,
    from: Asset,
    to: Asset,
    amount: string,
    slippage: number | undefined
  ): ApiRequest {
    const params: { [key: string]: string } = {
      fromAddress,
      toAddress,
      sourceContract,
      destinationContract,
      imMessage,
      amount,
      from: assetToString(from),
      to: assetToString(to),
      disableEstimate: 'false',
      contractCall: 'true'
    }
    if (slippage) {
      params['slippage'] = slippage.toString()
    }

    return {
      url: this.getSwapUrl(
        new URLSearchParams(params)
      )
    }
  }

  public isApprovedRequest(requestId: string, txId: string): ApiRequest {
    const params = new URLSearchParams({ requestId, txId })

    return {
      url: this.getIsApprovedUrl(params),
    }
  }

  public statusRequest(requestId: string, txId: string): ApiRequest {
    const params = new URLSearchParams({ requestId, txId })
    return {
      url: this.getStatusUrl(params),
    }
  }

  public receivedAmountRequest(id: string, paymentId: string, blockchain: string): ApiRequest {
    return {
      url: this.getReceivedAmountUrl(id, paymentId, blockchain)
    }
  }

  public successRequest(id: string, paymentId: string, currency: string, amount: number, language: string, email: string | null, blockchain: string | null): ApiRequest {
    return {
      url: this.getSuccessUrl(id, paymentId, currency, amount, language),
      method: 'POST',
      body: JSON.stringify({ email, blockchain })
    }
  }

  public blockchainPaymentLogRequest(id: string, paymentId: string, blockchain: string): ApiRequest {
    return {
      url: this.getBlockchainPaymentLogUrl(id, paymentId, blockchain)
    }
  }

  public paymentHistoryRequest(id: string, paymentId: string): ApiRequest {
    return {
      url: this.getPaymentHistoryUrl(id, paymentId),
      method: 'GET'
    }
  }

  public exchangeRatesRequest(currency: string, timestamps: number[]): ApiRequest {
    return {
      url: this.getExchangeRateUrl(currency),
      method: 'POST',
      body: JSON.stringify({ timestamps }),
    }
  }

  private getBlockchainPaymentLogUrl(id: string, paymentId: string, blockchain: string): string {
    return `{baseUrlApi}/api/payment/logs/${id}/${paymentId}/${blockchain}`
  }

  private getSettingsUrl(id: string, paymentId: string, currency: string) {
    return `{baseUrlApi}/api/payment/settings/${id}/${paymentId}/${currency}`
  }

  private getBalancesUrl(blockchain: string, address: string): string {
    return `{baseUrlApi}/api/payment/balance?blockchain=${blockchain}&address=${address}`
  }

  private getQuoteUrl(params: URLSearchParams) {
    return `{baseUrlApi}/api/payment/zap/quote?${params}`
  }

  private getSwapUrl(params: URLSearchParams) {
    return `{baseUrlApi}/api/payment/zap/swap?${params}`
  }

  private getIsApprovedUrl(params: URLSearchParams) {
    return `{baseUrlApi}/api/payment/zap/is-approved?${params}`
  }

  private getStatusUrl(params: URLSearchParams) {
    return `{baseUrlApi}/api/payment/zap/status?${params}`
  }

  private getReceivedAmountUrl(id: string, paymentId: string, blockchain: string): string {
    return `{baseUrlApi}/api/payment/received/${id}/${paymentId}/${blockchain}`
  }

  private getSuccessUrl(id: string, paymentId: string, currency: string, amountCurrency: number, language: string): string {
    return `{baseUrlApi}/api/payment/success/${id}/${paymentId}/${currency}/${amountCurrency}/${language}`
  }

  private getPaymentHistoryUrl(id: string, paymentId: string): string {
    return `{baseUrlApi}/api/payment/history/${id}/${paymentId}`
  }

  private getExchangeRateUrl(currency: string): string {
    return `{baseUrlApi}/api/payment/exchange/${currency}`
  }
}
