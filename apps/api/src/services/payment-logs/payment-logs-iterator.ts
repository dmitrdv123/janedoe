import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

export interface PaymentLogsIterator {
  lastProcessed(): string
  skip(lastProcessed: string): void
  nextBatch(): Promise<PaymentLog[]>
}
