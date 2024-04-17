import { DEFAULT_CURRENCY_DECIMAL_PLACES } from '../../constants'

interface CurrencyAmountProps {
  amount: number | null
  currency: string | null
}

const CurrencyAmount: React.FC<CurrencyAmountProps> = (props) => {
  return (
    <>
      {(props.amount !== null && props.currency) && (
        <span data-bs-toggle="tooltip" title={`${props.amount} ${props.currency.toLocaleUpperCase()}`}>
          {props.amount.toFixed(DEFAULT_CURRENCY_DECIMAL_PLACES)} {props.currency.toLocaleUpperCase()}
        </span>
      )}
    </>
  )
}

export default CurrencyAmount
