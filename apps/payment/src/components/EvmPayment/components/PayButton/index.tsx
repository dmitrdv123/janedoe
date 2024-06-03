import { FormEvent, useCallback, useEffect } from 'react'
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
import { useCloseModal, useOpenModal } from '../../../../states/application/hook'
import PaymentProcessingModal from '../../../modals/PaymentProcessingModal'

interface PayButtonProps {
  paymentDetails: PaymentDetails
  receivedCurrencyAmount: number,
  stages: string[],
  usePay: () => ContractCallResult<PaymentDetails>,
  onProcessing?: () => void,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
}

const PayButton: React.FC<PayButtonProps> = (props) => {
  const { paymentDetails, receivedCurrencyAmount, stages, usePay, onProcessing, onError, onSuccess } = props

  const { t } = useTranslation()

  const open = useOpenModal(ApplicationModal.PAYMENT_PROCESSING)
  const close = useCloseModal()
  const { currency } = usePaymentData()
  const exchangeRate = useExchangeRate()

  const { stage, status, details, txId, error, handle } = usePay()

  const handlePay = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    onProcessing?.()
    open()
    handle(paymentDetails)
  }, [paymentDetails, handle, open, onProcessing])

  useEffect(() => {
    switch (status) {
      case 'error':
        close()
        onError?.(error)
        break
      case 'success':
        close()
        onSuccess?.(txId)
        break
    }
  }, [status, txId, error, close, onError, onSuccess])

  return (
    <>
      <PaymentProcessingModal stages={stages} status={status} stage={stage} details={details} />

      <Button
        variant="primary"
        size="lg"
        disabled={status === 'processing'}
        onClick={handlePay}>

        {t('components.evm_payment.pay')}
        &nbsp;<TokenAmount
          amount={paymentDetails.fromTokenAmount}
          symbol={paymentDetails.fromToken.symbol}
          decimals={paymentDetails.fromToken.decimals}
        />

        {(!!paymentDetails.fromTokenAmount && !!paymentDetails.fromToken?.usdPrice && !!exchangeRate) && (
          <>
            &nbsp;(= <CurrencyAmount
              currency={currency}
              amount={tokenAmountToCurrency(
                paymentDetails.fromTokenAmount,
                paymentDetails.fromToken.usdPrice,
                paymentDetails.fromToken.decimals,
                exchangeRate
              )} />)
          </>
        )}

        {!!receivedCurrencyAmount && (
          <>
            <br />
            <small>
              {t('components.evm_payment.received')}
              &nbsp;<CurrencyAmount currency={currency} amount={receivedCurrencyAmount} />
            </small>
          </>
        )}
      </Button>
    </>
  )
}

export default PayButton
