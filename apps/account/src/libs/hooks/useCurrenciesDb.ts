import { useEffect, useState } from 'react'
import { create, insertMultiple, Orama } from '@orama/orama'

import { AppSettingsCurrency } from '../../types/app-settings'
import { currencySchema } from '../../types/orama'

export default function useCurrenciesDb(currencies: AppSettingsCurrency[] | undefined) {
  const [currenciesDb, setCurrenciesDb] = useState<Orama<typeof currencySchema> | undefined>(undefined)

  useEffect(() => {
    const createDB = async () => {
      if (currencies === undefined) {
        setCurrenciesDb(undefined)
      } else {
        const db: Orama<typeof currencySchema> = await create({
          schema: currencySchema,
        })

        await insertMultiple(db, currencies.map(currency => ({
          symbol: currency.symbol,
          desc: currency.desc,
          country: currency.country
        })))

        setCurrenciesDb(db)
      }
    }

    createDB()
  }, [currencies])

  return currenciesDb
}
