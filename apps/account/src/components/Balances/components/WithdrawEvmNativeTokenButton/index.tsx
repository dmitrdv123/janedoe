import { useCallback } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import useNativeTokenWithdraw from '../../../../libs/hooks/useNativeTokenWithdraw'
import { useInfoMessages } from '../../../../states/application/hook'
import { convertWagmiTransactionErrorToMessage } from '../../../../libs/utils'
import { INFO_MESSAGE_BALANCE_WITHDRAW_ERROR } from '../../../../constants'

interface WithdrawEvmNativeTokenButtonProps {
  blockchain: BlockchainMeta,
  amount: bigint,
  isDisable: boolean,
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined) => void
}

const WithdrawEvmNativeTokenButton: React.FC<WithdrawEvmNativeTokenButtonProps> = (props) => {
  const { blockchain, amount, isDisable, onProcessing, onSuccess } = props

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const errorCallback = useCallback((error: Error | undefined) => {
    if (error) {
      addInfoMessage(convertWagmiTransactionErrorToMessage(error, t('common.errors.default')), `${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${blockchain.name}`, 'danger')
    } else {
      addInfoMessage(t('components.balances.errors.transaction_error'), `${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${blockchain.name}`, 'danger')
    }
    onProcessing(false)
  }, [blockchain.name, t, onProcessing, addInfoMessage])

  const successCallback = useCallback((hash: string | undefined) => {
    removeInfoMessage(`${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${blockchain.name}`)
    onSuccess(hash)
    onProcessing(false)
  }, [blockchain.name, onProcessing, onSuccess, removeInfoMessage])

  const processingCallback = useCallback(() => {
    onProcessing(true)
  }, [onProcessing])

  const { status: withdrawStatus, handle: withdraw } = useNativeTokenWithdraw(
    blockchain,
    amount,
    errorCallback,
    successCallback,
    processingCallback
  )

  return (
    <Button variant="outline-secondary" onClick={withdraw} disabled={withdrawStatus === 'processing' || isDisable}>
      {t('components.balances.withdraw_btn')}
      {(withdrawStatus === 'processing') && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
          <span className="visually-hidden">{t('common.processing')}</span>
        </Spinner>
      )}
    </Button>
  )
}

export default WithdrawEvmNativeTokenButton
