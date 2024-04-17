export class ServiceError extends Error {
  constructor (
    message: string,
    public readonly code: string,
    public readonly args: {[key: string]: string} = {}
  ) {
    super(message)
  }
}
