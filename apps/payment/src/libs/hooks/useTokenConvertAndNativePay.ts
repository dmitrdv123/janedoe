import { useCallback, useEffect, useState } from 'react'

import { ContractCallResult } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useNativePay from './useNativePay'
import useTokenConvert from './useTokenConvert'

export default function useTokenConvertAndNativePay(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [txId, setTxId] = useState<string | undefined>(undefined)

  const {
    error: nativePayError,
    status: nativePayStatus,
    stage: nativePayStage,
    details: nativePayDetails,
    txId: nativePayTxId,
    handle: nativePayHandle
  } = useNativePay(
    paymentDetails,
    onError,
    onSuccess
  )

  const {
    error: tokenConvertError,
    status: tokenConvertStatus,
    stage: tokenConvertStage,
    details: tokenConvertDetails,
    txId: tokenConvertTxId,
    handle: tokenConvertHandle
  } = useTokenConvert(
    paymentDetails,
    onError,
    nativePayHandle
  )

  const handle = useCallback(() => {
    setError(undefined)
    setDetails(undefined)
    setStage(undefined)
    setTxId(undefined)
    setStatus('idle')

    tokenConvertHandle()
  }, [tokenConvertHandle])

  useEffect(() => {
    switch (tokenConvertStatus) {
      case 'processing':
        setError(undefined)
        setStage(tokenConvertStage)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('processing')
        break
      case 'error':
        setError(tokenConvertError)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setTxId(tokenConvertTxId)
        setDetails(tokenConvertDetails)
        break
    }
  }, [tokenConvertTxId, tokenConvertError, tokenConvertStatus, tokenConvertStage, tokenConvertDetails])

  useEffect(() => {
    switch (nativePayStatus) {
      case 'processing':
        setError(undefined)
        setStage(nativePayStage)
        setDetails(nativePayDetails)
        setTxId(nativePayTxId)
        setStatus('processing')
        break
      case 'error':
        setError(nativePayError)
        setDetails(nativePayDetails)
        setTxId(nativePayTxId)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setTxId(nativePayTxId)
        setDetails(nativePayDetails)
        break
    }
  }, [nativePayTxId, nativePayError, nativePayStatus, nativePayStage, nativePayDetails])

  return {
    status,
    stage,
    details,
    error,
    txId,
    handle
  }
}
