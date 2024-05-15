import { FormEvent, useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { tokenAmountToCurrency } from '../../../../libs/utils'
import { useExchangeRate } from '../../../../states/settings/hook'
import { ContractCallResult } from '../../../../types/contract-call-result'
import { PaymentDetails } from '../../../../types/payment-details'
import TokenAmount from '../../../TokenAmount'
import CurrencyAmount from '../../../CurrencyAmount'
import usePaymentData from '../../../../libs/hooks/usePaymentData'
import { ApplicationModal } from '../../../../types/application-modal'
import { useToggleModal } from '../../../../states/application/hook'
import PaymentProcessingModal from '../../../modals/PaymentProcessingModal'

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

  const toggle = useToggleModal(ApplicationModal.PAYMENT_PROCESSING)
  const { currency } = usePaymentData()
  const exchangeRate = useExchangeRate()

  const errorHandler = useCallback((error: Error | undefined) => {
    toggle()
    onError?.(error)
  }, [toggle, onError])

  const successHandler = useCallback((txId: string | undefined) => {
    toggle()
    onSuccess?.(txId)
  }, [toggle, onSuccess])

  const { status, data, handle } = usePay(paymentDetails, errorHandler, successHandler)

  const handlePay = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    toggle()
    handle()
  }, [toggle, handle])

  return (
    <>
      <PaymentProcessingModal data={data} />

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
      </Button>
    </>
  )
}

export default PayButton
