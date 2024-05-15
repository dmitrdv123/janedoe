import axios from 'axios'
import { CheckApprovalResponse, MetaResponse, QuoteResponse, StatusResponse, SwapResponse, WalletDetailsResponse } from 'rango-sdk-basic'

import appConfig from '../app-config'
import { isNullOrEmptyOrWhitespaces } from '../utils/utils'

export interface RangoWrapperService {
  meta(): Promise<MetaResponse>
  balance(params: string | undefined): Promise<WalletDetailsResponse>
  quote(params: string | undefined): Promise<QuoteResponse>
  swap(params: string | undefined): Promise<SwapResponse>
  isApproved(params: string | undefined): Promise<CheckApprovalResponse>
  status(params: string | undefined): Promise<StatusResponse>
}

export class RangoWrapperServiceImpl implements RangoWrapperService {
  public constructor() { }

  public async meta(): Promise<MetaResponse> {
    return await this.queryRangoWithRangoApi('meta/compact')
  }

  public async balance(params: string | undefined): Promise<WalletDetailsResponse> {
    return await this.queryRangoWithRangoApi('basic/balance', params)
  }

  public async quote(params: string | undefined): Promise<QuoteResponse> {
    return await this.queryRangoWithJaneDoeApi('basic/quote', params)
  }

  public async swap(params: string | undefined): Promise<SwapResponse> {
    return await this.queryRangoWithJaneDoeApi('basic/swap', params)
  }

  public async isApproved(params: string | undefined): Promise<CheckApprovalResponse> {
    return await this.queryRangoWithJaneDoeApi('is-approved', params)
  }

  public async status(params: string | undefined): Promise<StatusResponse> {
    return await this.queryRangoWithJaneDoeApi('basic/status', params)
  }

  private async queryRangoWithJaneDoeApi<T>(path: string, params?: string): Promise<T> {
    return await this.queryRango(path, appConfig.RANGO_API_KEY_SWAP, 'http://localhost:3000', params)
  }

  private async queryRangoWithRangoApi<T>(path: string, params?: string): Promise<T> {
    return await this.queryRango(path, appConfig.RANGO_API_KEY, 'https://app.rango.exchange', params)
  }

  private async queryRango<T>(path: string, apiKey: string, domain: string, params?: string): Promise<T> {
    var queryParams = `apiKey=${apiKey}`
    if (!isNullOrEmptyOrWhitespaces(params)) {
      queryParams += `&${params}`
    }

    const response = await axios.get<T>(`https://api.rango.exchange/${path}?${queryParams}`, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'origin': domain,
        'referer': domain,
      }
    })

    return response.data
  }
}
