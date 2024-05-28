import { useCallback, useEffect, useState } from 'react'

import { ContractCallResult } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useTokenApproveAndPay from './useTokenApproveAndPay'
import useTokenConvert from './useTokenConvert'

export default function useTokenConvertAndTokenPay(
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
    error: tokenPayError,
    status: tokenPayStatus,
    stage: tokenPayStage,
    details: tokenPayDetails,
    txId: tokenPayTxId,
    handle: tokenPayHandle
  } = useTokenApproveAndPay(
    {
      protocolPaymentId: paymentDetails.protocolPaymentId,
      fromBlockchain: paymentDetails.toBlockchain,
      fromToken: paymentDetails.toToken,
      toBlockchain: paymentDetails.toBlockchain,
      toToken: paymentDetails.toToken,
      fromAddress: paymentDetails.toAddress,
      toAddress: paymentDetails.toAddress,
      fromContracts: paymentDetails.toContracts,
      toContracts: paymentDetails.toContracts,
      fromTokenAmount: paymentDetails.toTokenAmount,
      toTokenAmount: paymentDetails.toTokenAmount,
      currencyAmount: paymentDetails.currencyAmount,
      currency: paymentDetails.currency,
      slippage: paymentDetails.slippage
    },
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
    tokenPayHandle
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
    switch (tokenPayStatus) {
      case 'processing':
        setError(undefined)
        setStage(tokenPayStage)
        setDetails(tokenPayDetails)
        setTxId(tokenPayTxId)
        setStatus('processing')
        break
      case 'error':
        setError(tokenPayError)
        setDetails(tokenPayDetails)
        setTxId(tokenPayTxId)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setTxId(tokenPayTxId)
        setDetails(tokenPayDetails)
        break
    }
  }, [tokenPayTxId, tokenPayError, tokenPayStatus, tokenPayStage, tokenPayDetails])

  return {
    status,
    stage,
    details,
    error,
    txId,
    handle
  }
}
