import { useCallback, useEffect, useState } from 'react'

import useTokenPay from './useTokenPay'
import useTokenApprove from './useTokenApprove'
import useTokenAllowance from './useTokenAllowance'
import { PaymentDetails } from '../../types/payment-details'
import { ContractCallResult, TokenPayStage } from '../../types/contract-call-result'
import { ApiRequestStatus } from '../../types/api-request'

export default function useTokenApproveAndPay(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void,
): ContractCallResult {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const {
    error: tokenAllowanceError,
    status: tokenAllowanceStatus,
    details: tokenAllowanceDetails,
    allowance: tokenAllowance,
    handle: tokenAllowanceHandle
  } = useTokenAllowance(
    paymentDetails.fromBlockchain,
    paymentDetails.fromToken,
    paymentDetails.fromAddress,
    paymentDetails.fromContracts.JaneDoe,
    onError
  )

  const errorPayHandler = useCallback((error: Error | undefined) => {
    tokenAllowanceHandle()
    onError?.(error)
  }, [tokenAllowanceHandle, onError])

  const tokenPaySuccessHandle = useCallback((txId: string | undefined) => {
    tokenAllowanceHandle()
    onSuccess?.(txId)
  }, [tokenAllowanceHandle, onSuccess])

  const {
    error: tokenPayError,
    status: tokenPayStatus,
    details: tokenPayDetails,
    txId: txId,
    handle: tokenPayHandle
  } = useTokenPay(
    paymentDetails.fromBlockchain,
    paymentDetails.fromToken,
    paymentDetails.fromContracts.JaneDoe,
    paymentDetails.fromAddress,
    paymentDetails.toAddress,
    paymentDetails.tokenAmount,
    paymentDetails.protocolPaymentId,
    errorPayHandler,
    tokenPaySuccessHandle
  )

  const tokenApproveSuccessHandle = useCallback(() => {
    tokenAllowanceHandle()
    tokenPayHandle()
  }, [tokenAllowanceHandle, tokenPayHandle])

  const {
    error: tokenApproveError,
    status: tokenApproveStatus,
    details: tokenApproveDetails,
    handle: tokenApproveHandle
  } = useTokenApprove(
    paymentDetails.fromBlockchain,
    paymentDetails.fromToken,
    paymentDetails.fromContracts.JaneDoe,
    paymentDetails.tokenAmount,
    errorPayHandler,
    tokenApproveSuccessHandle
  )

  const tokenResetApproveSuccessHandle = useCallback(() => {
    tokenAllowanceHandle()
    tokenApproveHandle()
  }, [tokenAllowanceHandle, tokenApproveHandle])

  const {
    error: tokenResetApproveError,
    status: tokenResetApproveStatus,
    details: tokenResetApproveDetails,
    handle: tokenResetApproveHandle
  } = useTokenApprove(
    paymentDetails.fromBlockchain,
    paymentDetails.fromToken,
    paymentDetails.fromContracts.JaneDoe,
    '0',
    errorPayHandler,
    tokenResetApproveSuccessHandle
  )

  const handle = useCallback(() => {
    setError(undefined)
    setDetails(undefined)
    setStage(undefined)
    setStatus('idle')

    if (tokenAllowance !== undefined && tokenAllowance >= BigInt(paymentDetails.tokenAmount)) {
      tokenPayHandle()
    } else if (tokenAllowance !== undefined && tokenAllowance === BigInt(0)) {
      tokenApproveHandle()
    } else {
      tokenResetApproveHandle()
    }
  }, [paymentDetails, tokenAllowance, tokenApproveHandle, tokenPayHandle, tokenResetApproveHandle])

  useEffect(() => {
    switch (tokenAllowanceStatus) {
      case 'processing':
        setError(undefined)
        setStage(TokenPayStage.TokenAllowance)
        setDetails(tokenAllowanceDetails)
        setStatus('processing')
        break
      case 'error':
        setError(tokenAllowanceError)
        setDetails(tokenAllowanceDetails)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(tokenAllowanceDetails)
        setStatus('idle')
        break
    }
  }, [tokenAllowanceError, tokenAllowanceStatus, tokenAllowanceDetails])

  useEffect(() => {
    switch (tokenResetApproveStatus) {
      case 'processing':
        setError(undefined)
        setDetails(tokenResetApproveDetails)
        setStage(TokenPayStage.TokenResetApprove)
        setStatus('processing')
        break
      case 'error':
        setError(tokenResetApproveError)
        setDetails(tokenResetApproveDetails)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(tokenResetApproveDetails)
        break
    }
  }, [tokenResetApproveError, tokenResetApproveStatus, tokenResetApproveDetails])

  useEffect(() => {
    switch (tokenApproveStatus) {
      case 'processing':
        setError(undefined)
        setDetails(tokenApproveDetails)
        setStage(TokenPayStage.TokenApprove)
        setStatus('processing')
        break
      case 'error':
        setError(tokenApproveError)
        setDetails(tokenApproveDetails)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(tokenApproveDetails)
        break
    }
  }, [tokenApproveError, tokenApproveStatus, tokenApproveDetails])

  useEffect(() => {
    switch (tokenPayStatus) {
      case 'processing':
        setError(undefined)
        setDetails(tokenPayDetails)
        setStage(TokenPayStage.TokenPay)
        setStatus('processing')
        break
      case 'error':
        setError(tokenPayError)
        setDetails(tokenPayDetails)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(tokenPayDetails)
        setStatus('success')
        break
    }
  }, [tokenPayError, tokenPayStatus, tokenPayDetails])

  return {
    status,
    stage,
    details,
    txId,
    error,
    handle
  }
}
