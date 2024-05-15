import { CloudWatch } from '@aws-sdk/client-cloudwatch'

export interface CloudwatchService {
  tryPutMetric(namespace: string, metricName: string, value: number): Promise<void>
}

export class CloudwatchServiceImpl implements CloudwatchService {
  public constructor(
    private cloudwatch: CloudWatch
  ) { }

  public async tryPutMetric(namespace: string, metricName: string, value: number): Promise<void> {
    try {
      await this.cloudwatch.putMetricData({
        Namespace: namespace,
        MetricData: [
          {
            MetricName: metricName,
            Unit: 'Count',
            Value: value
          },
        ],
      })
    } catch { }
  }
}