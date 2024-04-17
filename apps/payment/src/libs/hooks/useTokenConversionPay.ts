import { EvmTransaction } from 'rango-sdk-basic'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContractCallResult } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useTokenConversionSwap from './useTokenConversionSwap'
import useTokenConversionTransactionApproval from './useTokenConversionTransactionApproval'
import useTokenConversionTransactionMain from './useTokenConversionTransactionMain'

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

  const {
    status: mainStatus,
    error: mainError,
    handle: mainHandle
  } = useTokenConversionTransactionMain(
    requestId,
    evmTx,
    onError,
    onSuccess
  )

  const {
    status: approveStatus,
    error: approveError,
    handle: approveHandle
  } = useTokenConversionTransactionApproval(
    requestId,
    evmTx,
    onError,
    mainHandle
  )

  const {
    status: swapStatus,
    error: swapError,
    data: swapData,
    handle: swapHandle
  } = useTokenConversionSwap(paymentDetails, onError, approveHandle)

  const handle = useCallback(() => {
    setError(undefined)
    setData(undefined)
    setStatus('idle')

    if (!evmTx) {
      swapHandle()
    } else if (evmTx.approveTo && evmTx.approveData) {
      approveHandle()
    } else {
      mainHandle()
    }
  }, [evmTx, approveHandle, mainHandle, swapHandle])

  useEffect(() => {
    setRequestId(swapData?.requestId)
    setEvmTx(swapData?.tx as EvmTransaction | undefined)
  }, [swapData?.requestId, swapData?.tx])

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

  return {
    status,
    error,
    data,
    txId: requestId,
    handle
  }
}