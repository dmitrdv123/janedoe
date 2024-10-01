import { Token } from 'rango-sdk-basic'

import { MetaDao } from '@repo/dao/dist/src/dao/meta.dao'

import { TokenWithTimestampModel } from '../models/token-with-timestamp.model'

export class MetaDaoImpl implements MetaDao {
  public async listTokens(timestamp: number, blockchain: string, address: string | null): Promise<Token[]> {
    const result = await TokenWithTimestampModel.findById(
      [
        blockchain.toLocaleLowerCase(),
        address?.toLocaleLowerCase() ?? '',
        timestamp
      ].join(':')
    )
    return result?.tokens ?? []
  }

  public async saveTokens(timestamp: number, tokens: Token[]): Promise<void> {
    const tokensByPk: { [key: string]: Token[] } = tokens.reduce((acc, token) => {
      const pk = [
        token.blockchain.toLocaleLowerCase(),
        token.address?.toLocaleLowerCase() ?? '',
        timestamp
      ].join(':')

      if (!acc[pk]) {
        acc[pk] = []
      }
      acc[pk].push(token)

      return acc
    }, {} as { [key: string]: Token[] })

    await TokenWithTimestampModel.bulkWrite(
      Object.keys(tokensByPk).map(pk => ({
        updateOne: {
          filter: {
            _id: pk
          },
          update: {
            $set: {
              tokens: tokensByPk[pk],
              timestamp: timestamp
            }
          },
          upsert: true
        }
      }))
    )
  }

}
