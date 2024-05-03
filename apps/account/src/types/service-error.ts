export class ServiceError extends Error {
  public static readonly NAME = 'ServiceError'

  constructor(public message: string, public code: string, public args: {[key: string]: string} = {}) {
    super(message)
    this.name = ServiceError.NAME
  }
}
