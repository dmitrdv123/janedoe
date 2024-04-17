import { useEffect, useState } from 'react'
import { create, insertMultiple, Orama } from '@orama/orama'
import { Token } from 'rango-sdk-basic'

import { tokenSchema } from '../../types/orama'

export default function useTokenDb(tokens: Token[] | undefined) {
  const [tokensDb, setTokensDb] = useState<Orama<typeof tokenSchema> | undefined>(undefined)

  useEffect(() => {
    const createDB = async () => {
      if (!tokens) {
        setTokensDb(undefined)
      } else {
        const db: Orama<typeof tokenSchema> = await create({
          schema: tokenSchema,
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
          isPopular: token.isPopular
        })))

        setTokensDb(db)
      }
    }

    createDB()
  }, [tokens])

  return tokensDb
}
