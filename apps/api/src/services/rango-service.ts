import { CheckApprovalResponse, MetaResponse, QuoteResponse, StatusResponse, SwapResponse, WalletDetailsResponse } from 'rango-sdk-basic'

import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { RangoWrapperService } from '@repo/common/dist/src/services/rango-wrapper-service'

import { DEFAULT_RANGO_CACHING_SECONDS } from '../constants'

export interface RangoService {
  meta(): Promise<MetaResponse>
  balance(params: string | undefined): Promise<WalletDetailsResponse>
  quote(params: string | undefined): Promise<QuoteResponse>
  swap(params: string | undefined): Promise<SwapResponse>
  isApproved(params: string | undefined): Promise<CheckApprovalResponse>
  status(params: string | undefined): Promise<StatusResponse>
}

export class RangoServiceImpl implements RangoService {
  public constructor(
    private rangoWrapperService: RangoWrapperService,
    private cacheService: CacheService
  ) { }

  public async meta(): Promise<MetaResponse> {
    return this.cacheService.run(
      'rango#meta/compact',
      DEFAULT_RANGO_CACHING_SECONDS,
      async () => {
        return await this.rangoWrapperService.meta()
      }
    )
  }

  public async balance(params: string | undefined): Promise<WalletDetailsResponse> {
    return this.cacheService.run(
      'rango#basic/balance',
      DEFAULT_RANGO_CACHING_SECONDS,
      async () => {
        return await this.rangoWrapperService.balance(params)
      }
    )
  }

  public async quote(params: string | undefined): Promise<QuoteResponse> {
    return await this.rangoWrapperService.quote(params)
  }

  public async swap(params: string | undefined): Promise<SwapResponse> {
    return await this.rangoWrapperService.swap(params)
  }

  public async isApproved(params: string | undefined): Promise<CheckApprovalResponse> {
    return await this.rangoWrapperService.isApproved(params)
  }

  public async status(params: string | undefined): Promise<StatusResponse> {
    return await this.rangoWrapperService.status(params)
  }
}
