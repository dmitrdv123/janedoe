import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { AccountReceivedAmount, AccountReceivedAmountResult } from '../../types/account-received-amount'
import { ApiWrapper } from '../services/api-wrapper'
import { isNullOrEmptyOrWhitespaces } from '../utils'
import { useInterval } from './useInterval'
import useApiRequest from './useApiRequest'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_ACCOUNT_RECEIVED_AMOUNT_ERROR } from '../../constants'
import usePaymentData from './usePaymentData'

export default function useAccountReceivedAmount(blockchain: BlockchainMeta | undefined): AccountReceivedAmountResult {
  const { t } = useTranslation()
  const { id, paymentId } = usePaymentData()
  const { data, status, error, process: loadReceivedAmount } = useApiRequest<AccountReceivedAmount>()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const fetchReceivedAmountCallback = useCallback(async () => {
    if (!blockchain || !id || isNullOrEmptyOrWhitespaces(id) || !paymentId || isNullOrEmptyOrWhitespaces(paymentId)) {
      return
    }

    removeInfoMessage(INFO_MESSAGE_ACCOUNT_RECEIVED_AMOUNT_ERROR)
    try {
      await loadReceivedAmount(ApiWrapper.instance.receivedAmountRequest(id, paymentId, blockchain.name))
    } catch (error) {
      addInfoMessage(
        t('hooks.account_received_amount.errors.load_error', {
          blockchain: blockchain.name
        }),
        INFO_MESSAGE_ACCOUNT_RECEIVED_AMOUNT_ERROR,
        'danger',
        error
      )
    }
  }, [t, blockchain, id, paymentId, loadReceivedAmount, addInfoMessage, removeInfoMessage])

  // fetch every 10 seconds
  useInterval(fetchReceivedAmountCallback, 1000 * 10)

  return { data, status, error }
}
