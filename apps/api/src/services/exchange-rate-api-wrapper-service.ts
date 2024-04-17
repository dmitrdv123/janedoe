import axios from 'axios'

import { CacheService } from '@repo/common/dist/src/services/cache-service'
import appConfig from '@repo/common/dist/src/app-config'

import { DEFAULT_EXCHANGERATE_CACHING_SECONDS } from '../constants'
import { ExchangeRateResponse } from '../interfaces/exchange-rate'

export interface ExchangeRateApiWrapperService {
  exchangeRates(): Promise<ExchangeRateResponse>
}

export class ExchangeRateApiWrapperServiceImpl implements ExchangeRateApiWrapperService {
  public constructor(private cacheService: CacheService) { }

  public async exchangeRates(): Promise<ExchangeRateResponse> {
    return await this.queryWithCaching('latest/USD')
  }

  private async queryWithCaching<T>(path: string): Promise<T> {
    return this.cacheService.run(
      `exchange${path}`,
      DEFAULT_EXCHANGERATE_CACHING_SECONDS,
      async () => {
        return await this.query<T>(path)
      }
    )
  }

  private async query<T>(path: string): Promise<T> {
    const response = await axios.get<T>(`https://v6.exchangerate-api.com/v6/${appConfig.EXCHANGERATE_API_KEY}/${path}`)
    return response.data
  }
}
