import { formatToFixed } from '../../libs/utils'

interface TokenAmountProps {
  amount: string | null
  decimals: number | null
  symbol: string | null
}

const TokenAmount: React.FC<TokenAmountProps> = (props) => {
  return (
    <>
      {(props.amount) && (
        <span>
          {props.decimals ? formatToFixed(props.amount, props.decimals) : props.amount} {props.symbol?.toLocaleUpperCase()}
        </span>
      )}
    </>
  )
}

export default TokenAmount
