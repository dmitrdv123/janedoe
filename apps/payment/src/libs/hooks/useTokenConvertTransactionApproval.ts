import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EvmTransaction } from 'rango-sdk-basic'
import { useWaitForTransactionReceipt, useWalletClient } from 'wagmi'

import { ApiRequestStatus } from '../../types/api-request'
import { getAddressOrDefault, tryParseInt } from '../utils'
import { CHAINS } from '../../constants'
import { ServiceError } from '../../types/errors/service-error'

export default function useTokenConvertTransactionApproval() {
  const statusRef = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [txId, setTxId] = useState<`0x${string}` | undefined>(undefined)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()
  const { data: signer } = useWalletClient()
  const { status: waitStatus, error: waitError} = useWaitForTransactionReceipt({ hash: txId })

  useEffect(() => {
    if (!requestId || !txId) {
      return
    }

    switch (waitStatus) {
      case 'success':
        setData(undefined)
        setError(undefined)
        setStatus('success')
        statusRef.current = 'success'
        break
      case 'error':
        setData(t('hooks.token_conversion_approval.transaction_waiting_error', { requestId, txId }))
        setError(new ServiceError(waitError.message, 'hooks.token_conversion_approval.transaction_waiting_error', { requestId, txId }))
        setStatus('error')
        statusRef.current = 'error'
        break
      default:
        setData(t('hooks.token_conversion_approval.transaction_waiting', { requestId, txId }))
        setError(undefined)
        setStatus('processing')
        break
    }
  }, [requestId, t, txId, waitStatus, waitError])

  const handle = useCallback(async (requestIdToUse: string | undefined, evmTx: EvmTransaction | undefined) => {
    if (statusRef.current === 'processing') {
      return
    }

    setTxId(undefined)
    setData(undefined)
    setError(undefined)

    if (!signer || !requestIdToUse || !evmTx) {
      setStatus('idle')
      statusRef.current = 'idle'
      return
    }

    try {
      setData(t('hooks.token_conversion_approval.transaction_confirming', { requestIdToUse }))
      setRequestId(requestIdToUse)
      setStatus('processing')
      statusRef.current = 'processing'

      const evmTxChainId = tryParseInt(evmTx.blockChain.chainId)
      const chain = CHAINS.find(chain => chain.id === evmTxChainId)
      const account = evmTx?.from ? getAddressOrDefault(evmTx.from) : undefined
      const to = evmTx?.from ? getAddressOrDefault(evmTx.approveTo) : undefined
      const approveData = evmTx?.approveData ? evmTx.approveData as `0x${string}` : undefined
      const response = await signer.sendTransaction({ chain, account, to, data: approveData })

      setTxId(response)
      setData(t('hooks.token_conversion_approval.transaction_confirmed', { requestId: requestIdToUse, txId: response }))
    } catch (err) {
      const error = err as Error

      setTxId(undefined)
      setError(error)
      setStatus('error')

      statusRef.current = 'error'
    }
  }, [signer, t])

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}