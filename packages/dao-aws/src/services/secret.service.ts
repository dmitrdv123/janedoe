import { CreateSecretCommand, DescribeSecretCommand, GetSecretValueCommand, PutSecretValueCommand, SecretsManagerClient, SecretsManagerServiceException } from '@aws-sdk/client-secrets-manager'

export interface SecretService {
  loadSecret(secretName: string): Promise<string | undefined>
  saveSecret(secretName: string, data: string): Promise<void>
}

export class SecretServiceImpl implements SecretService {
  public constructor(
    private client: SecretsManagerClient
  ) { }

  public async loadSecret(secretName: string): Promise<string | undefined> {
    const data = await this.client.send(new GetSecretValueCommand({ SecretId: secretName }));
    return data.SecretString
  }

  public async saveSecret(secretName: string, data: string): Promise<void> {
    try {
      await this.client.send(new CreateSecretCommand({
        Name: secretName,
        SecretString: data
      }))
    } catch (error) {
      if (error instanceof SecretsManagerServiceException && error.name === 'ResourceExistsException') {
        await this.client.send(new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: data
        }))
      } else {
        throw error
      }
    }
  }
}