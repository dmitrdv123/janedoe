export class ServiceError extends Error {
  constructor(public message: string, public code: string, public args: {[key: string]: string} = {}) {
    super(message)
    this.name = 'ApiError'
  }
}
