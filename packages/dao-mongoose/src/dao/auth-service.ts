import { AuthDao } from '@repo/dao/src/dao/auth.dao'
import { Nonce } from '@repo/dao/src/interfaces/nonce'

import { NonceModel } from '../models/nonce.model'

export class AuthDaoImpl implements AuthDao {
  public async saveNonce(nonce: Nonce): Promise<void> {
    await NonceModel.create({
      ...nonce,
      _id: nonce.nonceId
    })
  }

  public async loadNonce(nonceId: string): Promise<Nonce | undefined> {
    const nonce = await NonceModel.findById(nonceId)
    return nonce?.toJSON()
  }

  public async deleteNonce(nonceId: string): Promise<void> {
    await NonceModel.deleteOne({ _id: nonceId })
  }
}
