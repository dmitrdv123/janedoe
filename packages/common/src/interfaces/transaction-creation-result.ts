export interface TransactionCreationResult {
  txId: string
  message: string
  code: string
  args: {[key: string]: string}
}
