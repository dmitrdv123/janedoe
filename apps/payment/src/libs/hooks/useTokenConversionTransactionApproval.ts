import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EvmTransaction, TransactionStatus } from 'rango-sdk-basic'
import { useWalletClient } from 'wagmi'

import { ApiRequestStatus } from '../../types/api-request'
import { ApiManager } from '../services/api-manager'
import { useConfig } from '../../context/config/hook'
import useDoUntil from './useDoUntil'
import { getAddressOrDefault, tryParseInt } from '../utils'
import { CHAINS } from '../../constants'

export default function useTokenConversionTransactionApproval(
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
) {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [txId, setTxId] = useState<string | undefined>(undefined)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const config = useConfig()
  const { t } = useTranslation()
  const { data: signer } = useWalletClient()
  const doUntilHandler = useDoUntil()

  useEffect(() => {
    if (status === 'processing' && txId && requestId && config.config) {
      const baseUrlApi = config.config.baseUrlApi

      const clearInterval = doUntilHandler(1000, async () => {
        try {
          const result = await ApiManager.instance.checkApproval(baseUrlApi, requestId, txId)

          switch (result.txStatus) {
            case TransactionStatus.SUCCESS:
              setData(undefined)
              setError(undefined)
              setStatus('success')
              onSuccess?.(txId)
              return true
            case TransactionStatus.FAILED:
              setData(t('hooks.token_conversion_approval.transaction_waiting_error', { requestId, txId }))
              setError(undefined)
              setStatus('processing')
              return false
            default:
              setData(t('hooks.token_conversion_approval.transaction_waiting', { requestId, txId }))
              setError(undefined)
              setStatus('processing')
              return false
          }
        } catch (err) {
          setData(t('hooks.token_conversion_approval.transaction_waiting_error', { requestId, txId }))
          setError(undefined)
          setStatus('processing')
          return false
        }
      })

      return clearInterval
    }
  }, [config.config, requestId, status, t, txId, doUntilHandler, onError, onSuccess])

  const handle = useCallback(async (requestIdToUse: string | undefined, evmTx: EvmTransaction | undefined) => {
    setTxId(undefined)
    setData(undefined)
    setError(undefined)
    setStatus('idle')

    if (!signer || !requestIdToUse || !evmTx) {
      setStatus('error')
      onError?.(undefined)
      return
    }

    try {
      const chain = CHAINS.find(chain => chain.id === tryParseInt(evmTx.blockChain.chainId))
      const account = evmTx?.from ? getAddressOrDefault(evmTx.from) : undefined
      const to = evmTx?.from ? getAddressOrDefault(evmTx.approveTo) : undefined
      const approveData = evmTx?.approveData ? evmTx.approveData as `0x${string}` : undefined

      setData(t('hooks.token_conversion_approval.transaction_confirming', { requestIdToUse }))
      setRequestId(requestIdToUse)
      setStatus('processing')

      const response = await signer.sendTransaction({ chain, account, to, data: approveData })

      setTxId(response)
      setData(t('hooks.token_conversion_approval.transaction_confirmed', { requestId: requestIdToUse, txId: response }))
      setError(undefined)
      setStatus('processing')
    } catch (err) {
      const error = err as Error

      setTxId(undefined)
      setError(error)
      setStatus('error')

      onError?.(error)
    }
  }, [signer, t, onError])

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}