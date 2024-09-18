import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Spinner } from 'react-bootstrap'

import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_PAYMENT_HISTORY_REFUND_ERROR } from '../../../../constants'
import { RefundResult } from '../../../../types/refund-result'
import { PaymentHistoryData } from '../../../../types/payment-history'
import InfoMessageAlert from '../../../InfoMessageAlert'
import { InfoMessage } from '../../../../types/info-message'

interface RefundModalButtonBtcProps {
  paymentHistory: PaymentHistoryData | undefined
  refundAddress: string | undefined
  refundAmount: string | undefined
  onUpdate: (refundResult: RefundResult) => void
}

const RefundModalButtonBtc: React.FC<RefundModalButtonBtcProps> = (props) => {
  const { paymentHistory, refundAddress, refundAmount, onUpdate } = props

  const [infoMessage, setInfoMessage] = useState<InfoMessage | undefined>(undefined)

  const { t } = useTranslation()
  const { status: refundStatus, process: refund } = useApiRequest<RefundResult>()

  const refundHandler = useCallback(async () => {
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
      setInfoMessage({
        error,
        key: INFO_MESSAGE_PAYMENT_HISTORY_REFUND_ERROR,
        content: t('components.payments.errors.fail_refund'),
        variant: 'danger'
      })
    }
  }, [paymentHistory, refundAddress, refundAmount, t, refund, onUpdate])

  return (
    <>
      <div className='mt-3'>
        <Button variant="primary" disabled={refundStatus === 'processing' || !paymentHistory || !refundAddress || !refundAmount} onClick={() => refundHandler()}>
          {t('components.payments.refund_btn')}
          {(refundStatus === 'processing') && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
              <span className="visually-hidden">{t('common.saving')}</span>
            </Spinner>
          )}
        </Button>
      </div>
      {(infoMessage) && (
        <div className='mt-3'>
          <InfoMessageAlert infoMessage={infoMessage} />
        </div>
      )}
    </>
  )
}

export default RefundModalButtonBtc
