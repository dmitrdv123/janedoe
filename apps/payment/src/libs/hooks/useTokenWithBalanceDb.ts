import { useEffect, useState } from 'react'
import { create, insertMultiple, Orama } from '@orama/orama'

import { tokenWithBalanceSchema } from '../../types/orama'
import { TokenWithBalance } from '../../types/token-with-balance'

export default function useTokenWithBalanceDb(tokens: TokenWithBalance[]) {
  const [tokensDb, setTokensDb] = useState<Orama<typeof tokenWithBalanceSchema> | undefined>(undefined)

  useEffect(() => {
    const createDB = async () => {
      const db: Orama<typeof tokenWithBalanceSchema> = await create({
        schema: tokenWithBalanceSchema,
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
        currency: token.currency,
        balance: token.balance ?? '0',
        balanceUsd: token.balanceUsd ?? 0,
        balanceCurrency: token.balanceCurrency ?? 0
      })))

      setTokensDb(db)
    }

    createDB()
  }, [tokens])

  return tokensDb
}
