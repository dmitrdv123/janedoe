import { MetricDao } from '@repo/dao/dist/src/dao/metric.dao'
import appConfig from '@repo/common/dist/src/app-config'

import { CloudwatchService } from '../services/cloudwatch.service'

export class MetricDaoImpl implements MetricDao {
  public constructor(
    private cloudwatchService: CloudwatchService
  ) { }

  public async putRangoErrorMetric(value: number): Promise<void> {
    await this.cloudwatchService.tryPutMetric(appConfig.METRIC_RANGO_NAMESPACE, appConfig.METRIC_RANGO_NAME, value)
  }

  public async putRangoConversionErrorMetric(value: number): Promise<void> {
    await this.cloudwatchService.tryPutMetric(appConfig.METRIC_RANGO_CONVERSION_NAMESPACE, appConfig.METRIC_RANGO_CONVERSION_NAME, value)
  }

  public async putBitcoinErrorMetric(value: number): Promise<void> {
    await this.cloudwatchService.tryPutMetric(appConfig.METRIC_BITCOIN_NAMESPACE, appConfig.METRIC_BITCOIN_NAME, value)
  }
}
