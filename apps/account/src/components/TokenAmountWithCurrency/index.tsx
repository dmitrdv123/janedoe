import TokenAmount from '../TokenAmount'
import CurrencyAmount from '../CurrencyAmount'

interface TokenAmountProps {
  tokenSymbol: string
  tokenDecimals: number
  tokenAmount: string | null

  currency : string | null
  currencyAmount: number | null

  hideZeroBalance?: boolean
}

const TokenAmountWithCurrency: React.FC<TokenAmountProps> = (props) => {
  const { tokenSymbol, tokenDecimals, tokenAmount, currency, currencyAmount, hideZeroBalance } = props

  return (
    <>
      {((!tokenAmount || BigInt(tokenAmount) === BigInt(0)) && !hideZeroBalance) && (
        <>
          0 {tokenSymbol}
        </>
      )}

      {(tokenAmount && BigInt(tokenAmount) > BigInt(0)) && (
        <>
          <TokenAmount
            amount={tokenAmount}
            symbol={tokenSymbol}
            decimals={tokenDecimals}
          />
          {currencyAmount !== null && (
            <>
              &nbsp;(= <CurrencyAmount currency={currency} amount={currencyAmount} />)
            </>
          )}
        </>
      )}
    </>
  )
}

export default TokenAmountWithCurrency
