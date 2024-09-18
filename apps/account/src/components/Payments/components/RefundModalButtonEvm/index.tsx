import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Spinner } from 'react-bootstrap'

import { useInfoMessages } from '../../../../states/application/hook'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_PAYMENT_HISTORY_REFUND_ERROR } from '../../../../constants'
import { RefundResult } from '../../../../types/refund-result'
import { PaymentHistoryData } from '../../../../types/payment-history'

interface RefundModalButtonEvmProps {
  paymentHistory: PaymentHistoryData | undefined
  refundAddress: string | undefined
  refundAmount: string | undefined
  onUpdate: (refundResult: RefundResult) => void
}

const RefundModalButtonEvm: React.FC<RefundModalButtonEvmProps> = (props) => {
  const { paymentHistory, refundAddress, refundAmount, onUpdate } = props

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const { status: refundStatus, process: refund } = useApiRequest<RefundResult>()

  const refundHandler = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_REFUND_ERROR)

    if (!paymentHistory || !refundAddress || !refundAmount) {
      return
    }

    try {
      const updatedIpnResult = await refund(ApiWrapper.instance.refundRequest(
        paymentHistory.paymentId, paymentHistory.blockchainName, paymentHistory.transaction, paymentHistory.index, refundAddress, refundAmount
      ))
      if (updatedIpnResult) {
        onUpdate(updatedIpnResult)
      }
    } catch (error) {
      addInfoMessage(
        t('components.payments.errors.fail_refund'),
        INFO_MESSAGE_PAYMENT_HISTORY_REFUND_ERROR,
        'danger',
        error
      )
    }
  }, [paymentHistory, refundAddress, refundAmount, t, onUpdate, refund, addInfoMessage, removeInfoMessage])

  return (
    <div className='mt-3'>
      <Button variant="primary" disabled={refundStatus === 'processing'} onClick={() => refundHandler()}>
        {t('components.payments.refund_btn')}
        {(refundStatus === 'processing') && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
            <span className="visually-hidden">{t('common.saving')}</span>
          </Spinner>
        )}
      </Button>

      {(refundStatus === 'error') && (
        <Alert variant='danger' className='mt-3 w-100'>
          {t('components.payments.errors.fail_refund')}
        </Alert>
      )}
    </div>
  )
}

export default RefundModalButtonEvm
