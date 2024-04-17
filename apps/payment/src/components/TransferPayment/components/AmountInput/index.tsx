import { Token } from 'rango-sdk-basic'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { Clipboard } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

import { formatToFixed } from '../../../../libs/utils'
import { DEFAULT_CURRENCY_DECIMAL_PLACES } from '../../../../constants'

interface AmountInputProps {
  token: Token
  tokenAmount: string
  currencyAmount: number
  currency: string
}

const AmountInput: React.FC<AmountInputProps> = (props) => {
  const { token, tokenAmount, currencyAmount, currency } = props

  const { t } = useTranslation()

  return (
    <>
      <Form.Label>
        {t('components.transfer_payment.amount')}
      </Form.Label>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={t('components.transfer_payment.amount_placeholder')}
          value={formatToFixed(tokenAmount, token.decimals)}
          readOnly
        />
        <Button variant="outline-secondary" onClick={() => { navigator.clipboard.writeText(formatToFixed(tokenAmount, token.decimals)) }}>
          <Clipboard />
        </Button>
      </InputGroup>
      <Form.Text className="text-muted">
        (= {currencyAmount.toFixed(DEFAULT_CURRENCY_DECIMAL_PLACES)} {currency.toUpperCase()})
      </Form.Text>
    </>
  )
}

export default AmountInput
