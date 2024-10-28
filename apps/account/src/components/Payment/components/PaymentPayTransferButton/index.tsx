import { useCallback } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_PAYMENT_HISTORY_OUTGOING_PAYMENT_ERROR } from '../../../../constants'
import { useInfoMessages } from '../../../../states/application/hook'
import { TransactionCreationResult } from '../../../../types/transaction-creation-result'

interface PaymentPayTransferButtonProps {
  selectedBlockchain: BlockchainMeta
  selectedAddress: string
  selectedTokenAmount: bigint
  onSuccess: (blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => void
}

const PaymentPayTransferButton: React.FC<PaymentPayTransferButtonProps> = (props) => {
  const { selectedBlockchain, selectedAddress, selectedTokenAmount, onSuccess } = props

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const { status: payStatus, process: pay } = useApiRequest<TransactionCreationResult>()

  const handlePay = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_OUTGOING_PAYMENT_ERROR)
    try {
      const result = await pay(ApiWrapper.instance.withdrawAccountBlockchainRequest(
        selectedBlockchain.name, selectedAddress, selectedTokenAmount.toString()
      ))
      const message = result?.code ? t(result.code, result.args) : undefined

      onSuccess(selectedBlockchain, result?.txId, message)
    } catch (error) {
      addInfoMessage(
        t('components.payment.errors.pay_error'),
        INFO_MESSAGE_PAYMENT_HISTORY_OUTGOING_PAYMENT_ERROR,
        'danger',
        error
      )
    }
  }, [selectedBlockchain, selectedAddress, selectedTokenAmount, t, onSuccess, pay, addInfoMessage, removeInfoMessage])

  return (
    <Button
      variant="primary"
      size="lg"
      disabled={payStatus === 'processing'}
      onClick={handlePay}
    >
      {t('components.payment.pay_btn')}
      {(payStatus === 'processing') && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
          <span className="visually-hidden">{t('common.processing')}</span>
        </Spinner>
      )}
    </Button>
  )
}

export default PaymentPayTransferButton
