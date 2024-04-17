import { Nonce } from '../interfaces/nonce'

export interface AuthDao {
  saveNonce(nonce: Nonce): Promise<void>
  loadNonce(nonceId: string): Promise<Nonce | undefined>
  deleteNonce(nonceId: string): Promise<void>
}
