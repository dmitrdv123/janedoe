import { useEffect, useState } from 'react'

import { DEFAULT_TOKEN_DECIMAL_PLACES } from '../../constants'
import { formatToFixed } from '../../libs/utils'

interface TokenAmountProps {
  amount: string
  symbol: string | null
  decimals: number | null
}

const TokenAmount: React.FC<TokenAmountProps> = (props) => {
  const { amount, symbol, decimals } = props

  const [amountFormatted, setAmountFormatted] = useState('')

  useEffect(() => {
    if (decimals === null) {
      setAmountFormatted(amount)
      return
    }

    let amountFormattedTmp = formatToFixed(amount, decimals, DEFAULT_TOKEN_DECIMAL_PLACES)
    if (!parseFloat(amountFormattedTmp)) {
      amountFormattedTmp = formatToFixed(amount, decimals)
    }

    setAmountFormatted(amountFormattedTmp)
  }, [amount, decimals])

  return (
    <>
      {amountFormatted} {symbol?.toLocaleUpperCase()}
    </>
  )
}

export default TokenAmount
