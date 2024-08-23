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
    return await this.queryRangoWithRangoApi('meta/compact', 'enableCentralizedSwappers=true')
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
    return await this.queryRango('https://api.rango.exchange', path, appConfig.RANGO_API_KEY_SWAP, params)
  }

  private async queryRangoWithRangoApi<T>(path: string, params?: string): Promise<T> {
    const headers = {
      'content-type': 'application/json;charset=UTF-8',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7',
      'origin': 'https://app.rango.exchange',
      'priority': 'u=1, i',
      'referer': 'https://app.rango.exchange/',
      'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    }

    return await this.queryRango('https://api-edge.rango.exchange', path, appConfig.RANGO_API_KEY, params, headers)
  }

  private async queryRango<T>(domain: string, path: string, apiKey: string, params?: string, headers?: { [key: string]: string }): Promise<T> {
    var queryParams = `apiKey=${apiKey}`
    if (!isNullOrEmptyOrWhitespaces(params)) {
      queryParams += `&${params}`
    }

    const response = await axios.get<T>(`${domain}/${path}?${queryParams}`, { headers })
    return response.data
  }
}
