import { BlockchainMeta, Token } from 'rango-sdk-basic'

export function convertErrorToMessage(error: any, defaultMessage: string, curDepth: number = 1, maxDepth: number = 10): string {
  if ('string' === typeof error) {
    return error
  }

  if (error.message) {
    return error.message
  }

  if (error.errors) {
    const result: string[] = error.errors.map((item: any) => convertErrorToMessage(item, defaultMessage))
    return result.join('\n')
  }

  if (error.error && curDepth < maxDepth) {
    return convertErrorToMessage(error.error, defaultMessage, ++curDepth)
  }

  return defaultMessage
}

export function findBlockchainByName(blockchains: BlockchainMeta[], name: string): BlockchainMeta | undefined {
  return blockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === name.toLocaleLowerCase())
}

export function isBlockchainToken(blockchain: BlockchainMeta, token: Token): boolean {
  return token.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
}

export function tokenDefaultResultComparator(a: Token, b: Token): number {
  if (a.blockchain > b.blockchain) {
    return 1
  }
  if (a.blockchain < b.blockchain) {
    return -1
  }

  if (a.address && !b.address) {
    return 1
  }

  if (!a.address && b.address) {
    return -1
  }

  return stringComparator(a.symbol as string, b.symbol as string)
}

export function stringComparator(a: string, b: string) {
  if (!a || !b) {
    return -1
  }

  return a.toLocaleLowerCase() > b.toLocaleLowerCase() ? 1 : -1
}

export function isNullOrEmptyOrWhitespaces(str: string | null | undefined): boolean {
  return str === undefined || str === null || str.trim() === ''
}
