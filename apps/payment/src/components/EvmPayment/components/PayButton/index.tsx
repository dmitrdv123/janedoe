import { FormEvent, useCallback, useEffect } from 'react'
import { Button } from 'react-bootstrap'

import { ContractCallResult } from '../../../../types/contract-call-result'
import { PaymentDetails } from '../../../../types/payment-details'
import { ApplicationModal } from '../../../../types/application-modal'
import { useCloseModal, useOpenModal } from '../../../../states/application/hook'
import PaymentProcessingModal from '../../../modals/PaymentProcessingModal'

interface PayButtonProps {
  title: string
  paymentDetails: PaymentDetails
  stages: string[]
  usePay: () => ContractCallResult<PaymentDetails>
  onProcessing?: () => void
  onError?: (error: Error | undefined) => void
  onSuccess?: (txId: string | undefined) => void
}

const PayButton: React.FC<PayButtonProps> = (props) => {
  const { title, paymentDetails, stages, usePay, onProcessing, onError, onSuccess } = props

  const open = useOpenModal(ApplicationModal.PAYMENT_PROCESSING)
  const close = useCloseModal()

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
        {title}
      </Button>
    </>
  )
}

export default PayButton
