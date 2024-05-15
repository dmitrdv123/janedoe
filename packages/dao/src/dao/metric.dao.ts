export interface MetricDao {
  putRangoErrorMetric(value: number): Promise<void>
  putRangoConversionErrorMetric(value: number): Promise<void>
  putBitcoinErrorMetric(value: number): Promise<void>
}
