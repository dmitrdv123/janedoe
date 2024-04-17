import { create, insertMultiple, Orama } from '@orama/orama'
import { BlockchainMeta } from 'rango-sdk-basic'
import { useEffect, useState } from 'react'

import { blockchainSchema } from '../../types/orama'

export default function useBlockchainsDb(blockchains: BlockchainMeta[] | undefined) {
  const [blockchainsDb, setBlockchainsDb] = useState<Orama<typeof blockchainSchema> | undefined>(undefined)

  useEffect(() => {
    const createDB = async () => {
      if (blockchains === undefined) {
        setBlockchainsDb(undefined)
      } else {
        const db: Orama<typeof blockchainSchema> = await create({
          schema: blockchainSchema,
        })

        await insertMultiple(db, blockchains.map(blockchain => ({
          name: blockchain.name,
          displayName: blockchain.displayName,
          logo: blockchain.logo,
          sort: blockchain.sort
        })))

        setBlockchainsDb(db)
      }
    }

    createDB()
  }, [blockchains])

  return blockchainsDb
}
