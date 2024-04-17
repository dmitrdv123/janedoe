export class BitcoinCoreError extends Error {
  constructor (public readonly code: number, message: string) {
    super(message)
    this.code = code
  }
}
