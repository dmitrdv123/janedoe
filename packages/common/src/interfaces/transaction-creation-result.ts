export interface TransactionCreationResult {
  transaction: string
  index: number
  message: string
  code: string
  args: {[key: string]: string}
}
