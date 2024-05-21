import { useTranslation } from 'react-i18next'

import { usePaymentSettings } from '../../states/settings/hook'
import CurrencyAmount from '../CurrencyAmount'
import usePaymentData from '../../libs/hooks/usePaymentData'

interface PaymentSummaryProps {
  receivedCurrencyAmount: number
}

const PaymentSummary: React.FC<PaymentSummaryProps> = (props) => {
  const { receivedCurrencyAmount } = props

  const { t } = useTranslation()

  const { id, paymentId, amount, currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()

  return (
    <>
      <h2>
        <strong>
          <CurrencyAmount amount={amount} currency={currency} />
        </strong>
      </h2>

      <div>{t('components.payment_summary.company_id')}: {id}</div>
      <div>{t('components.payment_summary.payment_id')}: {paymentId}</div>

      {!!paymentSettings?.description && (
        <div>{paymentSettings?.description}</div>
      )}

      {(!!receivedCurrencyAmount) && (
        <div>
          {t('components.payment_summary.received_currency')}: <CurrencyAmount amount={receivedCurrencyAmount} currency={currency} />
        </div>
      )}
    </>
  )
}

export default PaymentSummary
