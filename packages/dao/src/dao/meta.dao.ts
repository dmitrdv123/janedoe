import { Token } from 'rango-sdk-basic'

export interface MetaDao {
  listTokens(timestamp: number, blockchain: string, address: string | null): Promise<Token[]>
  saveTokens(timestamp: number, tokens: Token[]): Promise<void>
}
