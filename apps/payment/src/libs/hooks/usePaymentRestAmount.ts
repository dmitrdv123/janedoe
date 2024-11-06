import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBlockchains, useExchangeRate, useTokens } from '../../states/settings/hook'
import usePaymentLogs from './usePaymentLog'
import usePaymentData from './usePaymentData'
import { ApiRequestStatus } from '../../types/api-request'
import { INFO_MESSAGE_PAYMENT_LOGS_ERROR } from '../../constants'
import { useInfoMessages } from '../../states/application/hook'

export default function usePaymentRestAmount() {
  const [restCurrencyAmount, setRestCurrencyAmount] = useState(0)
  const [receivedCurrencyAmount, setReceivedCurrencyAmount] = useState(0)
  const [lastTxId, setLastTxId] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const isPaymentLogsLoadingRef = useRef(false)

  const { t } = useTranslation()

  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const { amount: requiredCurrencyAmount } = usePaymentData()

  const loadPaymentLogs = usePaymentLogs()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const reloadHandler = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_LOGS_ERROR)

    if (!blockchains || !tokens || !exchangeRate) {
      return
    }

    try {
      isPaymentLogsLoadingRef.current = true
      const result = await loadPaymentLogs(blockchains, tokens)

      const recentPaymentLogItem = result && result.length > 0
        ? result.reduce((prev, current) => (prev.timestamp > current.timestamp) ? prev : current, result[0])
        : undefined

      const amountUsd = result?.reduce((acc, item) => acc + (item.amountUsdAtPaymentTime ?? 0), 0) ?? 0
      const receivedCurrencyAmountTmp = exchangeRate * amountUsd
      const delta = requiredCurrencyAmount - receivedCurrencyAmountTmp
      const restCurrencyAmountTmp = delta <= 0 ? 0 : delta

      setLastTxId(recentPaymentLogItem?.transaction)
      setReceivedCurrencyAmount(receivedCurrencyAmountTmp)
      setRestCurrencyAmount(restCurrencyAmountTmp)
      setStatus('success')
    } catch (error) {
      setRestCurrencyAmount(requiredCurrencyAmount)
      setStatus('error')

      addInfoMessage(t('hooks.payment_rest_amount.errors.load_error'), INFO_MESSAGE_PAYMENT_LOGS_ERROR, 'error', error)
    }
  }, [blockchains, tokens, exchangeRate, requiredCurrencyAmount, t, loadPaymentLogs, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (!isPaymentLogsLoadingRef.current) {
      reloadHandler()
    }
  }, [reloadHandler])

  return {
    restCurrencyAmount,
    receivedCurrencyAmount,
    status,
    lastTxId,
    reload: reloadHandler
  }
}
