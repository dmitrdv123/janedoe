import { EvmTransaction, SwapResponse } from 'rango-sdk-basic'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContractCallResult } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useTokenConversionSwap from './useTokenConversionSwap'
import useTokenConversionTransactionApproval from './useTokenConversionTransactionApproval'
import useTokenConversionTransactionMain from './useTokenConversionTransactionMain'
import { useAccount, useSwitchChain } from 'wagmi'
import { tryParseInt } from '../utils'

export default function useTokenConversionPay(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)
  const [evmTx, setEvmTx] = useState<EvmTransaction | undefined>(undefined)

  const { t } = useTranslation()
  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { chainId: currentChainId } = useAccount()

  const {
    status: mainStatus,
    error: mainError,
    handle: mainHandle
  } = useTokenConversionTransactionMain(
    onError,
    onSuccess
  )

  const approveSuccessHandler = useCallback(() => {
    mainHandle(requestId, evmTx)
  }, [requestId, evmTx, mainHandle])

  const {
    status: approveStatus,
    error: approveError,
    handle: approveHandle
  } = useTokenConversionTransactionApproval(
    onError,
    approveSuccessHandler
  )

  const swapSuccessHandler = useCallback((data: SwapResponse) => {
    const execTx = (requestIdToUse: string | undefined, evmTxToUse: EvmTransaction | undefined) => {
      if (evmTxToUse?.approveTo && evmTxToUse.approveData) {
        approveHandle(requestIdToUse, evmTxToUse)
      } else {
        mainHandle(requestIdToUse, evmTxToUse)
      }
    }

    const evmTransaction = data.tx as EvmTransaction

    setRequestId(data.requestId)
    setEvmTx(evmTransaction)

    const chainId = tryParseInt(evmTransaction.blockChain.chainId)
    if (chainId && currentChainId !== chainId) {
      switchChain({ chainId }, { onSuccess: () => execTx(data.requestId, evmTransaction)})
    } else {
      execTx(data.requestId, evmTransaction)
    }
  }, [currentChainId, approveHandle, mainHandle, switchChain])

  const {
    status: swapStatus,
    error: swapError,
    handle: swapHandle
  } = useTokenConversionSwap(paymentDetails, onError, swapSuccessHandler)

  const handle = useCallback(() => {
    setError(undefined)
    setData(undefined)
    setEvmTx(undefined)
    setRequestId(undefined)
    setStatus('idle')

    swapHandle()
  }, [swapHandle])

  useEffect(() => {
    switch (swapStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_conversion_pay.token_swap_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(swapError)
        setData(undefined)
        setStatus('error')
        break
    }
  }, [swapError, swapStatus, t])

  useEffect(() => {
    switch (approveStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_conversion_pay.token_approve_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(approveError)
        setData(undefined)
        setStatus('error')
        break
    }
  }, [approveError, approveStatus, t])

  useEffect(() => {
    switch (mainStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_conversion_pay.token_pay_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(mainError)
        setData(undefined)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setData(undefined)
        setStatus('success')
        break
    }
  }, [mainError, mainStatus, t])

  useEffect(() => {
    switch (switchChainStatus) {
      case 'pending':
        setError(undefined)
        setData(t('hooks.token_conversion_pay.token_pay_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(switchChainError ? new Error(switchChainError.message) : undefined)
        setData(undefined)
        setStatus('error')
        break
    }
  }, [switchChainError, switchChainStatus, t])

  return {
    status,
    error,
    data,
    txId: requestId,
    handle
  }
}