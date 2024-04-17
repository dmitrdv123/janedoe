import { PaymentLog } from '@repo/dao/src/interfaces/payment-log'

export interface PaymentLogWithId extends PaymentLog {
  _id: string
}
