import { useCallback, useEffect, useRef, useState } from 'react'

import { ContractCallResult, ConvertNativePayStage } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useNativePay from './useNativePay'
import useTokenConvert from './useTokenConvert'
import { currencyToTokenAmount, findToken } from '../utils'
import { useExchangeRate, useTokens } from '../../states/settings/hook'
import { ServiceError } from '../../types/errors/service-error'

export default function useTokenConvertAndNativePay(): ContractCallResult<PaymentDetails> {
  const statusRef = useRef<ApiRequestStatus>('idle')
  const stageRef = useRef<ConvertNativePayStage | undefined>(undefined)
  const paymentDetailsRef = useRef<PaymentDetails | undefined>(undefined)

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [txId, setTxId] = useState<string | undefined>(undefined)

  const tokens = useTokens()
  const exchangeRate = useExchangeRate()

  const {
    error: tokenConvertError,
    status: tokenConvertStatus,
    details: tokenConvertDetails,
    txId: tokenConvertTxId,
    handle: tokenConvertHandle
  } = useTokenConvert()

  const {
    error: nativePayError,
    status: nativePayStatus,
    details: nativePayDetails,
    txId: nativePayTxId,
    handle: nativePayHandle
  } = useNativePay()

  const tokenConvertSuccessHandler = useCallback(() => {
    if (!paymentDetailsRef.current || !tokens || !exchangeRate) {
      setError(new ServiceError('Unexpected error happens', 'common.errors.unexpected'))
      setStatus('error')

      return
    }

    stageRef.current = ConvertNativePayStage.NativePay

    const toToken = findToken(tokens, paymentDetailsRef.current.toBlockchain, paymentDetailsRef.current.toToken.symbol, paymentDetailsRef.current.toToken.address)
    if (!toToken?.usdPrice) {
      setError(new ServiceError('Unexpected error happens', 'common.errors.unexpected'))
      setStatus('error')

      return
    }

    const toTokenAmount  = currencyToTokenAmount(paymentDetailsRef.current.currencyAmount, toToken.usdPrice, toToken.decimals, exchangeRate)

    nativePayHandle({
      protocolPaymentId: paymentDetailsRef.current.protocolPaymentId,
      fromBlockchain: paymentDetailsRef.current.toBlockchain,
      fromToken: paymentDetailsRef.current.toToken,
      toBlockchain: paymentDetailsRef.current.toBlockchain,
      toToken: paymentDetailsRef.current.toToken,
      fromAddress: paymentDetailsRef.current.toAddress,
      toAddress: paymentDetailsRef.current.toAddress,
      fromContracts: paymentDetailsRef.current.toContracts,
      toContracts: paymentDetailsRef.current.toContracts,
      fromTokenAmount: toTokenAmount,
      toTokenAmount: toTokenAmount,
      toTokenSwapAmount: toTokenAmount,
      currencyAmount: paymentDetailsRef.current.currencyAmount,
      currency: paymentDetailsRef.current.currency,
      slippage: paymentDetailsRef.current.slippage
    })
  }, [exchangeRate, tokens, nativePayHandle])

  const handle = useCallback((paymentDetails: PaymentDetails) => {
    if (statusRef.current === 'processing') {
      return
    }
    statusRef.current = 'processing'
    stageRef.current = ConvertNativePayStage.TokenConvert
    paymentDetailsRef.current = paymentDetails

    setError(undefined)
    setDetails(undefined)
    setStage(undefined)
    setTxId(undefined)
    setStatus('idle')

    tokenConvertHandle(paymentDetails)
  }, [tokenConvertHandle])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== ConvertNativePayStage.TokenConvert) {
      return
    }

    switch (tokenConvertStatus) {
      case 'processing':
        setError(undefined)
        setStage(ConvertNativePayStage.TokenConvert)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('processing')
        break
      case 'error':
        setError(tokenConvertError)
        setStage(ConvertNativePayStage.TokenConvert)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setStage(ConvertNativePayStage.TokenConvert)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('processing')

        tokenConvertSuccessHandler()

        break
    }
  }, [tokenConvertTxId, tokenConvertError, tokenConvertStatus, tokenConvertDetails, tokenConvertSuccessHandler])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== ConvertNativePayStage.NativePay) {
      return
    }

    switch (nativePayStatus) {
      case 'processing':
        setError(undefined)
        setStage(ConvertNativePayStage.NativePay)
        setDetails(nativePayDetails)
        setTxId(nativePayTxId)
        setStatus('processing')
        break
      case 'error':
        setError(nativePayError)
        setStage(ConvertNativePayStage.NativePay)
        setDetails(nativePayDetails)
        setTxId(nativePayTxId)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setStage(ConvertNativePayStage.NativePay)
        setDetails(nativePayDetails)
        setTxId(nativePayTxId)
        setStatus('success')
        statusRef.current = 'success'
        break
    }
  }, [nativePayTxId, nativePayError, nativePayStatus, nativePayDetails])

  return {
    status,
    stage,
    details,
    error,
    txId,
    handle
  }
}
