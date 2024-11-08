import { create, insertMultiple, Orama } from '@orama/orama'
import { useEffect, useState } from 'react'

import { tokenExtSchema } from '../../types/orama'
import { TokenExt } from '../../types/token-ext'

export default function useTokensExtDb(tokens: TokenExt[] | undefined) {
  const [tokensDb, setTokensDb] = useState<Orama<typeof tokenExtSchema> | undefined>(undefined)

  useEffect(() => {
    const createTokensDB = async () => {
      if (tokens === undefined) {
        setTokensDb(undefined)
      } else {
        const db: Orama<typeof tokenExtSchema> = await create({
          schema: tokenExtSchema,
        })

        await insertMultiple(db, tokens.map(token => ({
          blockchain: token.blockchain,
          chainId: token.chainId ?? '',
          address: token.address ?? '',
          symbol: token.symbol,
          name: token.name ?? '',
          decimals: token.decimals,
          image: token.image,
          blockchainImage: token.blockchainImage,
          usdPrice: token.usdPrice ?? 0,
          isPopular: token.isPopular,
          settingIndex: token.settingIndex,
          balance: token.balance ?? '0',
          balanceUsd: token.balanceUsd ?? 0,
        })))

        setTokensDb(db)
      }
    }

    createTokensDB()
  }, [tokens])

  return tokensDb
}
