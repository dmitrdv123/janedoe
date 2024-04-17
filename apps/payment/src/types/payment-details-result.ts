import { PaymentDetails } from './payment-details'

export interface PaymentDetailsResult {
  data: PaymentDetails | undefined
  isLoading: boolean
}
