import { StatusResponse } from 'rango-sdk-basic'

export class PaymentConversionError extends Error {
  public static readonly NAME = 'PaymentConversionError'

  constructor(
    message: string,
    public data: StatusResponse,
    public requestId: string,
    public txId: string
  ) {
    super(message)
    this.name = PaymentConversionError.NAME
  }
}
