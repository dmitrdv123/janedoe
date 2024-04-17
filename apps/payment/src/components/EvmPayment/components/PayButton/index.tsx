import { FormEvent, useCallback } from 'react'
import { Alert, Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { tokenAmountToCurrency } from '../../../../libs/utils'
import { useExchangeRate } from '../../../../states/settings/hook'
import { ContractCallResult } from '../../../../types/contract-call-result'
import { PaymentDetails } from '../../../../types/payment-details'
import TokenAmount from '../../../TokenAmount'
import CurrencyAmount from '../../../CurrencyAmount'
import usePaymentData from '../../../../libs/hooks/usePaymentData'

interface PayButtonProps {
  paymentDetails: PaymentDetails
  usePay: (
    paymentDetails: PaymentDetails,
    onError?: (error: Error | undefined) => void,
    onSuccess?: (txId: string | undefined) => void,
  ) => ContractCallResult,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void,
}

const PayButton: React.FC<PayButtonProps> = (props) => {
  const { paymentDetails, usePay, onError, onSuccess } = props

  const { t } = useTranslation()

  const { currency } = usePaymentData()
  const exchangeRate = useExchangeRate()
  const { status, data, handle } = usePay(paymentDetails, onError, onSuccess )

  const handlePay = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    handle()
  }, [handle])

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        disabled={status === 'processing'}
        onClick={handlePay}>

        {t('components.evm_payment.pay')}

        <br />

        <TokenAmount
          symbol={paymentDetails.fromToken.symbol}
          decimals={paymentDetails.fromToken.decimals}
          amount={paymentDetails.tokenAmount}
        />

        {(!!paymentDetails.tokenAmount && !!paymentDetails.fromToken?.usdPrice && !!exchangeRate) && (
          <>
            &nbsp;(= <CurrencyAmount
              currency={currency}
              amount={tokenAmountToCurrency(
                paymentDetails.tokenAmount,
                paymentDetails.fromToken.usdPrice,
                paymentDetails.fromToken.decimals,
                exchangeRate
              )} />)
          </>
        )}

        {(status === 'processing') && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
            <span className="visually-hidden">{t('common.processing')}</span>
          </Spinner>
        )}
      </Button>

      {!!data && (
        <Alert variant='light' className='mt-2'>
          {data}
        </Alert>
      )}
    </>
  )
}

export default PayButton
