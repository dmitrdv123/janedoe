import { useCallback, useEffect, useState } from 'react'

import useTokenPay from './useTokenPay'
import useTokenApprove from './useTokenApprove'
import useTokenAllowance from './useTokenAllowance'
import { PaymentDetails } from '../../types/payment-details'
import { ContractCallResult } from '../../types/contract-call-result'
import { ApiRequestStatus } from '../../types/api-request'
import { useTranslation } from 'react-i18next'

export default function useTokenApproveAndPay(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void,
): ContractCallResult {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()

  const {
    error: tokenAllowanceError,
    status: tokenAllowanceStatus,
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
    handle: tokenResetApproveHandle
  } = useTokenApprove(
    paymentDetails.fromBlockchain,
    paymentDetails.fromToken,
    paymentDetails.fromContracts.JaneDoe,
    '0',
    errorPayHandler,
    tokenResetApproveSuccessHandle
  )

  useEffect(() => {
    switch (tokenAllowanceStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_approve_and_pay.token_allowance_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(tokenAllowanceError)
        setData(undefined)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setData(undefined)
        setStatus('idle')
        break
    }
  }, [tokenAllowanceError, tokenAllowanceStatus, t])

  useEffect(() => {
    switch (tokenResetApproveStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_approve_and_pay.token_reset_approve_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(tokenResetApproveError)
        setData(undefined)
        setStatus('error')
        break
    }
  }, [tokenResetApproveError, tokenResetApproveStatus, t])

  useEffect(() => {
    switch (tokenApproveStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_approve_and_pay.token_approve_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(tokenApproveError)
        setData(undefined)
        setStatus('error')
        break
    }
  }, [tokenApproveError, tokenApproveStatus, t])

  useEffect(() => {
    switch (tokenPayStatus) {
      case 'processing':
        setError(undefined)
        setData(t('hooks.token_approve_and_pay.token_pay_processing'))
        setStatus('processing')
        break
      case 'error':
        setError(tokenPayError)
        setData(undefined)
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setData(undefined)
        setStatus('success')
        break
    }
  }, [tokenPayError, tokenPayStatus, t])

  const handle = useCallback(() => {
    setError(undefined)
    setData(undefined)
    setStatus('idle')

    if (tokenAllowance !== undefined && tokenAllowance >= BigInt(paymentDetails.tokenAmount)) {
      tokenPayHandle()
    } else if (tokenAllowance !== undefined && tokenAllowance === BigInt(0)) {
      tokenApproveHandle()
    } else {
      tokenResetApproveHandle()
    }
  }, [paymentDetails, tokenAllowance, tokenApproveHandle, tokenPayHandle, tokenResetApproveHandle])

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}
