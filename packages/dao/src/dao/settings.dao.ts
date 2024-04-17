export interface SettingsDao {
  loadSettings<T>(prefix: string, ...keys: string[]): Promise<T | undefined>
  saveSettings<T>(settings: T, prefix: string, ...keys: string[]): Promise<void>
}
