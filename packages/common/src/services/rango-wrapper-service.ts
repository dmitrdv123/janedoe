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
    return await this.queryRango('meta/compact')
  }

  public async balance(params: string | undefined): Promise<WalletDetailsResponse> {
    return await this.queryRango('basic/balance', params)
  }

  public async quote(params: string | undefined): Promise<QuoteResponse> {
    return await this.queryRango('basic/quote', params)
  }

  public async swap(params: string | undefined): Promise<SwapResponse> {
    return await this.queryRango('basic/swap', params)
  }

  public async isApproved(params: string | undefined): Promise<CheckApprovalResponse> {
    return await this.queryRango('is-approved', params)
  }

  public async status(params: string | undefined): Promise<StatusResponse> {
    return await this.queryRango('status', params)
  }

  private async queryRango<T>(path: string, params?: string): Promise<T> {
    var queryParams = `apiKey=${appConfig.RANGO_API_KEY}`
    if (!isNullOrEmptyOrWhitespaces(params)) {
      queryParams += `&${params}`
    }

    const response = await axios.get<T>(`https://api.rango.exchange/${path}?${queryParams}`, {
      headers: {
        'authority': 'api.rango.exchange',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7',
        'content-type': 'application/json;charset=UTF-8',
        'origin': 'https://app.rango.exchange',
        'referer': 'https://app.rango.exchange/',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    })

    return response.data
  }
}
