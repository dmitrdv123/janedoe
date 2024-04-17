import { SecretDao } from '@repo/dao/dist/src/dao/secret.dao'
import { SecretService } from '../services/secret.service'

export class SecretDaoImpl implements SecretDao {
  public constructor(
    private secretService: SecretService
  ) { }

  public async loadSecret(secretName: string): Promise<string | undefined> {
    return await this.secretService.loadSecret(secretName)
  }
}
