import { BlockchainMeta, QuoteRequest, SwapRequest, assetToString } from 'rango-sdk-basic'

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

  public quoteRequest(request: QuoteRequest, slippage: number): ApiRequest {
    const params: { [key: string]: string } = {
      slippage: slippage.toString()
    }

    if (request.sourceContract) {
      params['sourceContract'] = request.sourceContract
    }

    if (request.destinationContract) {
      params['destinationContract'] = request.destinationContract
    }

    if (request.imMessage) {
      params['imMessage'] = request.imMessage
    }

    if (request.amount) {
      params['amount'] = request.amount
    }

    if (request.from) {
      params['from'] = assetToString(request.from)
    }

    if (request.to) {
      params['to'] = assetToString(request.to)
    }

    if (request.contractCall) {
      params['contractCall'] = 'true'
    } else {
      params['contractCall'] = 'false'
    }

    if (request.enableCentralizedSwappers) {
      params['enableCentralizedSwappers'] = 'true'
    } else {
      params['enableCentralizedSwappers'] = 'false'
    }

    if (request.swappers !== undefined && request.swappers.length > 0) {
      params['swappers'] = request.swappers.join(',')
    }

    if (request.swappersExclude !== undefined) {
      params['swappersExclude'] = request.swappersExclude ? 'true' : 'false'
    }

    return {
      url: this.getQuoteUrl(
        new URLSearchParams(params)
      )
    }
  }

  public swapRequest(request: SwapRequest): ApiRequest {
    const params: { [key: string]: string } = {
      fromAddress: request.fromAddress,
      toAddress: request.toAddress,
      from: assetToString(request.from),
      to: assetToString(request.to),
      amount: request.amount,
      slippage: request.slippage
    }

    if (request.sourceContract) {
      params['sourceContract'] = request.sourceContract
    }

    if (request.destinationContract) {
      params['destinationContract'] = request.destinationContract
    }

    if (request.imMessage) {
      params['imMessage'] = request.imMessage
    }

    if (request.contractCall) {
      params['contractCall'] = 'true'
    } else {
      params['contractCall'] = 'false'
    }

    if (request.enableCentralizedSwappers) {
      params['enableCentralizedSwappers'] = 'true'
    } else {
      params['enableCentralizedSwappers'] = 'false'
    }

    if (request.disableEstimate) {
      params['disableEstimate'] = 'true'
    } else {
      params['disableEstimate'] = 'false'
    }

    if (request.swappers !== undefined && request.swappers.length > 0) {
      params['swappers'] = request.swappers.join(',')
    }

    if (request.swappersExclude !== undefined) {
      params['swappersExclude'] = request.swappersExclude ? 'true' : 'false'
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

  public successRequest(id: string, blockchain: string, txid: string, currency: string, amountCurrency: number, language: string, email: string | null): ApiRequest {
    return {
      url: this.getSuccessUrl(id, blockchain, txid),
      method: 'POST',
      body: JSON.stringify({
        blockchain, txid, currency, amountCurrency, language, email
      })
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

  private getSuccessUrl(id: string, blockchain: string, txid: string): string {
    return `{baseUrlApi}/api/payment/success/${id}/${blockchain}/${txid}`
  }

  private getPaymentHistoryUrl(id: string, paymentId: string): string {
    return `{baseUrlApi}/api/payment/history/${id}/${paymentId}`
  }

  private getExchangeRateUrl(currency: string): string {
    return `{baseUrlApi}/api/payment/exchange/${currency}`
  }
}
