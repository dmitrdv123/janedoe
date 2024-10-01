import { SettingsDao } from '@repo/dao/dist/src/dao/settings.dao'
import { SettingsModel } from '../models/settings.model'

export class SettingsDaoImpl implements SettingsDao {
  public async loadSettings<T>(prefix: string, ...keys: string[]): Promise<T | undefined> {
    const blockchainSettings = await SettingsModel.findById(
      [prefix.toLocaleLowerCase(), ...keys.map(key => key.toLocaleLowerCase())].join(':')
    )
    return blockchainSettings?.toJSON()
  }

  public async saveSettings<T>(settings: T, prefix: string, ...keys: string[]): Promise<void> {
    await SettingsModel.create({
      _id: [prefix.toLocaleLowerCase(), ...keys.map(key => key.toLocaleLowerCase())].join(':'),
      settings
    })
  }
}
