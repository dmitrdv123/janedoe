import { CheckApprovalResponse, MetaResponse, QuoteResponse, StatusResponse, SwapResponse, TransactionStatus, WalletDetailsResponse } from 'rango-sdk-basic'

import { CacheService } from '@repo/common/dist/src/services/cache-service'
import { RangoWrapperService } from '@repo/common/dist/src/services/rango-wrapper-service'
import { MetricDao } from '@repo/dao/dist/src/dao/metric.dao'

import { DEFAULT_RANGO_CACHING_SECONDS } from '../constants'
import { logger } from '../utils/logger'

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
    private cacheService: CacheService,
    private metricDao: MetricDao
  ) { }

  public async meta(): Promise<MetaResponse> {
    return this.cacheService.run(
      'rango#meta/compact',
      DEFAULT_RANGO_CACHING_SECONDS,
      async () => {
        try {
          return await this.rangoWrapperService.meta()
        } catch (error) {
          await this.metricDao.putRangoErrorMetric(1)
          throw error
        }
      }
    )
  }

  public async balance(params: string | undefined): Promise<WalletDetailsResponse> {
    try {
      return await this.rangoWrapperService.balance(params)
    } catch (error) {
      await this.metricDao.putRangoErrorMetric(1)
      throw error
    }
  }

  public async quote(params: string | undefined): Promise<QuoteResponse> {
    try {
      return await this.rangoWrapperService.quote(params)
    } catch (error) {
      await this.metricDao.putRangoErrorMetric(1)
      throw error
    }
  }

  public async swap(params: string | undefined): Promise<SwapResponse> {
    try {
      return await this.rangoWrapperService.swap(params)
    } catch (error) {
      await this.metricDao.putRangoErrorMetric(1)
      throw error
    }
  }

  public async isApproved(params: string | undefined): Promise<CheckApprovalResponse> {
    try {
      return await this.rangoWrapperService.isApproved(params)
    } catch (error) {
      await this.metricDao.putRangoErrorMetric(1)
      throw error
    }
  }

  public async status(params: string | undefined): Promise<StatusResponse> {
    try {
      const response = await this.rangoWrapperService.status(params)

      if (response.status === TransactionStatus.FAILED) {
        logger.warn(`RangoService: payment with conversion failed for ${params}`)
        logger.warn(response)

        await this.metricDao.putRangoConversionErrorMetric(1)
      }

      return response
    } catch (error) {
      await this.metricDao.putRangoErrorMetric(1)
      throw error
    }
  }
}
