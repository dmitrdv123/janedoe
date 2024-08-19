import { useCallback } from 'react'
import { BlockchainMeta } from 'rango-sdk-basic'
import { Spinner, Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'

import useTokensWithdraw from '../../../../libs/hooks/useTokensWithdraw'
import useReadBalances from '../../../../libs/hooks/useReadBalances'
import { INFO_MESSAGE_BALANCE_WITHDRAW_ERROR } from '../../../../constants'
import { convertWagmiTransactionErrorToMessage } from '../../../../libs/utils'
import { useInfoMessages } from '../../../../states/application/hook'

interface BalancesBlockchainEvmProps {
  blockchain: BlockchainMeta
  isDisable: boolean,
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined) => void
}

const WithdrawAllButton: React.FC<BalancesBlockchainEvmProps> = (props) => {
  const { blockchain, isDisable, onProcessing, onSuccess } = props

  const { t } = useTranslation()
  const { isConnected } = useAccount()
  const { open } = useWeb3Modal()

  const readBalancesResult = useReadBalances(blockchain)
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

  const { status: withdrawStatus, handle: withdraw } = useTokensWithdraw(
    blockchain,
    readBalancesResult?.tokens,
    errorCallback,
    successCallback,
    processingCallback
  )

  const withdrawHandler = useCallback(() => {
    if (isConnected) {
      withdraw()
    } else {
      open({ view: 'Connect' })
    }
  }, [isConnected, open, withdraw])

  return (
    <Button variant="primary" onClick={withdrawHandler} disabled={withdrawStatus === 'processing' || isDisable || !readBalancesResult.tokens || readBalancesResult.tokens.length === 0}>
      {(withdrawStatus === 'processing') && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      )}

      {isConnected && (t('components.balances.withdraw_all_btn'))}
      {!isConnected && (t('components.balances.connect_btn'))}

    </Button>
  )
}

export default WithdrawAllButton
