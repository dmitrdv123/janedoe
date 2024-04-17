import { DEFAULT_TOKEN_DECIMAL_PLACES } from '../../constants'
import { formatToFixed } from '../../libs/utils'

interface TokenAmountProps {
  symbol: string | null
  decimals: number | null
  amount: string
}

const TokenAmount: React.FC<TokenAmountProps> = (props) => {
  const { symbol, decimals, amount } = props

  return (
    <>
      {(decimals !== null) && (
        <>
          {formatToFixed(amount, decimals, DEFAULT_TOKEN_DECIMAL_PLACES)} {symbol}
        </>
      )}

      {(decimals === null) && (
        <>
          {amount} {symbol}
        </>
      )}
    </>
  )
}

export default TokenAmount
