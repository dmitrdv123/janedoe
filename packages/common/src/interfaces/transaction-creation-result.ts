export interface TransactionCreationResult {
  txId: string
  index: number
  message: string
  code: string
  args: {[key: string]: string}
}
