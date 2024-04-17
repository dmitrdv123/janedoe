import { DEFAULT_CURRENCY_DECIMAL_PLACES } from '../../constants'

interface CurrencyAmountProps {
  currency: string
  amount: number
}

const CurrencyAmount: React.FC<CurrencyAmountProps> = (props) => {
  const { currency, amount } = props

  return (
    <>
      {amount.toFixed(DEFAULT_CURRENCY_DECIMAL_PLACES)} {currency.toLocaleUpperCase()}
    </>
  )
}

export default CurrencyAmount
