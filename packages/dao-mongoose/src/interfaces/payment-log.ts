import { PaymentLog } from '@repo/dao/dist/src/interfaces/payment-log'

export interface PaymentLogWithId extends PaymentLog {
  _id: string
}
