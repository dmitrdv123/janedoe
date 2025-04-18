import { Token } from 'rango-sdk-basic'
import { Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import CurrencyAmount from '../../../CurrencyAmount'
import TokenAmount from '../../../TokenAmount'

interface StatusButtonProps {
  token: Token
  currency: string
  tokenAmount: string
  restCurrencyAmount: number
  receivedCurrencyAmount: number
}

const StatusButton: React.FC<StatusButtonProps> = (props) => {
  const { token, currency, tokenAmount, restCurrencyAmount, receivedCurrencyAmount } = props

  const { t } = useTranslation()

  return (
    <Button variant="primary" disabled size='lg'>
      {t('components.transfer_payment.pay')}
      &nbsp;<TokenAmount amount={tokenAmount} symbol={token.symbol} decimals={token.decimals} />
      &nbsp;(= <CurrencyAmount currency={currency} amount={restCurrencyAmount} />)

      <br />

      {t('components.transfer_payment.received')}
      &nbsp;<CurrencyAmount currency={currency} amount={receivedCurrencyAmount} />

      <Spinner as="span" animation="border" role="status" aria-hidden="true" className='ms-1' size='sm'>
        <span className="visually-hidden">{t('common.processing')}</span>
      </Spinner>
    </Button>
  )
}

export default StatusButton
