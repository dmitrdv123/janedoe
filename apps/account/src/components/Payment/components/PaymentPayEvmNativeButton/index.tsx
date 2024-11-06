import { useCallback } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { INFO_MESSAGE_BALANCE_WITHDRAW_ERROR } from '../../../../constants'
import { useInfoMessages } from '../../../../states/application/hook'
import { convertWagmiTransactionErrorToMessage } from '../../../../libs/utils'
import useNativeTokenWithdraw from '../../../../libs/hooks/useNativeTokenWithdraw'

interface PaymentPayEvmNativeButtonProps {
  selectedBlockchain: BlockchainMeta
  selectedAddress: string
  selectedTokenAmount: bigint
  disabled: boolean
  onSuccess: (blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => void
}

const PaymentPayEvmNativeButton: React.FC<PaymentPayEvmNativeButtonProps> = (props) => {
  const { selectedBlockchain, selectedAddress, selectedTokenAmount, disabled, onSuccess } = props

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const errorCallback = useCallback((error: Error | undefined) => {
    if (error) {
      addInfoMessage(convertWagmiTransactionErrorToMessage(error, t('common.errors.default')), `${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${selectedBlockchain.name}`, 'danger')
    } else {
      addInfoMessage(t('components.balances.errors.transaction_error'), `${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${selectedBlockchain.name}`, 'danger')
    }
  }, [selectedBlockchain.name, t, addInfoMessage])

  const successCallback = useCallback((hash: string | undefined) => {
    removeInfoMessage(`${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${selectedBlockchain.name}`)
    onSuccess(selectedBlockchain, hash)
  }, [selectedBlockchain, onSuccess, removeInfoMessage])

  const { status: withdrawStatus, handle: withdraw } = useNativeTokenWithdraw(
    selectedBlockchain,
    selectedTokenAmount,
    selectedAddress,
    errorCallback,
    successCallback
  )

  return (
    <Button
      variant="primary"
      size="lg"
      disabled={disabled || withdrawStatus === 'processing'}
      onClick={withdraw}
    >
      {t('components.payment.pay_btn')}
      {(withdrawStatus === 'processing') && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
          <span className="visually-hidden">{t('common.processing')}</span>
        </Spinner>
      )}
    </Button>
  )
}

export default PaymentPayEvmNativeButton
