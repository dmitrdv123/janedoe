import { StatusResponse } from 'rango-sdk-basic'

export class PaymentConversionError extends Error {
  public static readonly NAME = 'PaymentConversionError'

  constructor(public message: string, public data: StatusResponse) {
    super(message)
    this.name = PaymentConversionError.NAME
  }
}
