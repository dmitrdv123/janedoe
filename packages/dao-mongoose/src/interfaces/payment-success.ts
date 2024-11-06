import { PaymentSuccess } from '@repo/dao/dist/src/interfaces/payment-success'

export interface PaymentSuccessWithId extends PaymentSuccess {
  _id: string
}
