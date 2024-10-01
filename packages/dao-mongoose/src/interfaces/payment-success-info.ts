import { PaymentSuccessInfo } from '@repo/dao/dist/src/interfaces/payment-success-info'

export interface PaymentSuccessInfoWithId extends PaymentSuccessInfo {
  _id: string
}
