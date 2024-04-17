import { PaymentSuccessInfo } from '@repo/dao/src/interfaces/payment-success-info'

export interface PaymentSuccessInfoWithId extends PaymentSuccessInfo {
  _id: string
}
