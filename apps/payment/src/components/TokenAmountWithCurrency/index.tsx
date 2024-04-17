import TokenAmount from '../TokenAmount'
import CurrencyAmount from '../CurrencyAmount'

interface TokenAmountProps {
  tokenSymbol: string
  tokenDecimals: number
  tokenAmount: string | null

  currency : string
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
          <TokenAmount symbol={tokenSymbol} decimals={tokenDecimals} amount={tokenAmount}/> {currencyAmount !== null &&(
            <>
              (= <CurrencyAmount currency={currency} amount={currencyAmount} />)
            </>
          )}
        </>
      )}
    </>
  )
}

export default TokenAmountWithCurrency
