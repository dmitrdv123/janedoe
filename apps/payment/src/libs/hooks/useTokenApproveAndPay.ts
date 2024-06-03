import { useCallback, useEffect, useRef, useState } from 'react'

import useTokenPay from './useTokenPay'
import useTokenApprove from './useTokenApprove'
import useTokenAllowance from './useTokenAllowance'
import { PaymentDetails } from '../../types/payment-details'
import { ContractCallResult, TokenPayStage } from '../../types/contract-call-result'
import { ApiRequestStatus } from '../../types/api-request'

export default function useTokenApproveAndPay(): ContractCallResult<PaymentDetails> {
  const statusRef = useRef<ApiRequestStatus>('idle')
  const stageRef = useRef<string | undefined>(undefined)
  const paymentDetailsRef = useRef<PaymentDetails | undefined>(undefined)

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
  } = useTokenAllowance()

  const {
    error: tokenResetApproveError,
    status: tokenResetApproveStatus,
    details: tokenResetApproveDetails,
    handle: tokenResetApproveHandle
  } = useTokenApprove()

  const {
    error: tokenApproveError,
    status: tokenApproveStatus,
    details: tokenApproveDetails,
    handle: tokenApproveHandle
  } = useTokenApprove()

  const {
    error: tokenPayError,
    status: tokenPayStatus,
    details: tokenPayDetails,
    txId: txId,
    handle: tokenPayHandle
  } = useTokenPay()

  const tokenAllowanceSuccessHandler = useCallback((allowance: bigint | undefined) => {
    if (!paymentDetailsRef.current) {
      return
    }

    if (allowance !== undefined && allowance >= BigInt(paymentDetailsRef.current.fromTokenAmount)) {
      stageRef.current = TokenPayStage.TokenPay
      tokenPayHandle({
        blockchain: paymentDetailsRef.current.fromBlockchain,
        token: paymentDetailsRef.current.fromToken,
        janeDoe: paymentDetailsRef.current.fromContracts.JaneDoe,
        from: paymentDetailsRef.current.fromAddress,
        to: paymentDetailsRef.current.toAddress,
        amount: paymentDetailsRef.current.fromTokenAmount,
        paymentId: paymentDetailsRef.current.protocolPaymentId
      })
    } else if (allowance !== undefined && allowance === BigInt(0)) {
      stageRef.current = TokenPayStage.TokenApprove
      tokenApproveHandle({
        blockchain: paymentDetailsRef.current.fromBlockchain,
        token: paymentDetailsRef.current.fromToken,
        spender: paymentDetailsRef.current.fromContracts.JaneDoe,
        amount: paymentDetailsRef.current.fromTokenAmount
      })
    } else {
      stageRef.current = TokenPayStage.TokenResetApprove
      tokenResetApproveHandle({
        blockchain: paymentDetailsRef.current.fromBlockchain,
        token: paymentDetailsRef.current.fromToken,
        spender: paymentDetailsRef.current.fromContracts.JaneDoe,
        amount: '0'
      })
    }
  }, [tokenApproveHandle, tokenPayHandle, tokenResetApproveHandle])

  const tokenResetApproveSuccessHandle = useCallback(() => {
    if (!paymentDetailsRef.current) {
      return
    }

    stageRef.current = TokenPayStage.TokenApprove
    tokenApproveHandle({
      blockchain: paymentDetailsRef.current.fromBlockchain,
      token: paymentDetailsRef.current.fromToken,
      spender: paymentDetailsRef.current.fromContracts.JaneDoe,
      amount: paymentDetailsRef.current.fromTokenAmount
    })
  }, [tokenApproveHandle])

  const tokenApproveSuccessHandle = useCallback(() => {
    if (!paymentDetailsRef.current) {
      return
    }

    stageRef.current = TokenPayStage.TokenPay
    tokenPayHandle({
      blockchain: paymentDetailsRef.current.fromBlockchain,
      token: paymentDetailsRef.current.fromToken,
      janeDoe: paymentDetailsRef.current.fromContracts.JaneDoe,
      from: paymentDetailsRef.current.fromAddress,
      to: paymentDetailsRef.current.toAddress,
      amount: paymentDetailsRef.current.fromTokenAmount,
      paymentId: paymentDetailsRef.current.protocolPaymentId
    })
  }, [tokenPayHandle])

  const handle = useCallback((paymentDetails: PaymentDetails) => {
    if (statusRef.current === 'processing') {
      return
    }
    statusRef.current = 'processing'
    stageRef.current = TokenPayStage.TokenAllowance
    paymentDetailsRef.current = paymentDetails

    setError(undefined)
    setDetails(undefined)
    setStage(undefined)
    setStatus('processing')

    tokenAllowanceHandle(
      paymentDetails.fromBlockchain,
      paymentDetails.fromToken,
      paymentDetails.fromAddress,
      paymentDetails.fromContracts.JaneDoe,
    )
  }, [tokenAllowanceHandle])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenPayStage.TokenAllowance) {
      return
    }

    switch (tokenAllowanceStatus) {
      case 'processing':
        setError(undefined)
        setStage(TokenPayStage.TokenAllowance)
        setDetails(tokenAllowanceDetails)
        setStatus('processing')
        break
      case 'error':
        setError(tokenAllowanceError)
        setStage(TokenPayStage.TokenAllowance)
        setDetails(tokenAllowanceDetails)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setStage(TokenPayStage.TokenAllowance)
        setDetails(tokenAllowanceDetails)
        setStatus('processing')

        tokenAllowanceSuccessHandler(tokenAllowance)

        break
    }
  }, [tokenAllowance, tokenAllowanceError, tokenAllowanceStatus, tokenAllowanceDetails, tokenAllowanceSuccessHandler])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenPayStage.TokenResetApprove) {
      return
    }

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
        setStage(TokenPayStage.TokenResetApprove)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setDetails(tokenResetApproveDetails)
        setStage(TokenPayStage.TokenResetApprove)
        setStatus('processing')

        tokenResetApproveSuccessHandle()

        break
    }
  }, [tokenResetApproveError, tokenResetApproveStatus, tokenResetApproveDetails, tokenResetApproveSuccessHandle])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenPayStage.TokenApprove) {
      return
    }

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
        setStage(TokenPayStage.TokenApprove)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setDetails(tokenApproveDetails)
        setStage(TokenPayStage.TokenApprove)
        setStatus('processing')

        tokenApproveSuccessHandle()

        break
    }
  }, [tokenApproveError, tokenApproveStatus, tokenApproveDetails, tokenApproveSuccessHandle])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenPayStage.TokenPay) {
      return
    }

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
        setStage(TokenPayStage.TokenPay)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setDetails(tokenPayDetails)
        setStage(TokenPayStage.TokenPay)
        setStatus('success')
        statusRef.current = 'success'
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
