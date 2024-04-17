export interface SecretDao {
  loadSecret(secretName: string): Promise<string | undefined>
}
