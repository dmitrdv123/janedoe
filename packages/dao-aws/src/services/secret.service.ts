import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export interface SecretService {
  loadSecret(secretName: string): Promise<string | undefined>
}

export class SecretServiceImpl implements SecretService {
  public constructor(
    private client: SecretsManagerClient
  ) { }

  public async loadSecret(secretName: string): Promise<string | undefined> {
    const data = await this.client.send(new GetSecretValueCommand({ SecretId: secretName }));
    return data.SecretString
  }
}