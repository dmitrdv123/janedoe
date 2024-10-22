import { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_PAYMENT_HISTORY_OUTGOING_PAYMENT_ERROR } from '../../../../constants'
import { useInfoMessages } from '../../../../states/application/hook'
import { TransactionCreationResult } from '../../../../types/transaction-creation-result'

interface PaymentPayTransferButtonProps {
  selectedBlockchain: BlockchainMeta | undefined
  selectedToken: Token | undefined
  selectedAddress: string | undefined
  selectedTokenAmount: string | undefined
  onSuccess: (blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => void
}

const PaymentPayTransferButton: React.FC<PaymentPayTransferButtonProps> = (props) => {
  const { selectedBlockchain, selectedToken, selectedAddress, selectedTokenAmount, onSuccess } = props

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const { status: payStatus, process: pay } = useApiRequest<TransactionCreationResult>()

  const handlePay = useCallback(async () => {
    if (!selectedBlockchain || !selectedToken || !selectedAddress || !selectedTokenAmount) {
      return
    }

    removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_OUTGOING_PAYMENT_ERROR)
    try {
      const result = await pay(ApiWrapper.instance.withdrawAccountBlockchainRequest(
        selectedBlockchain.name, selectedAddress, selectedTokenAmount
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
  }, [selectedBlockchain, selectedToken, selectedAddress, selectedTokenAmount, t, onSuccess, pay, addInfoMessage, removeInfoMessage])

  return (
    <Button
      variant="primary"
      size="lg"
      disabled={payStatus === 'processing'}
      onClick={handlePay}
    >
      {t('components.payment.pay_btn')}
    </Button>
  )
}

export default PaymentPayTransferButton
