import { useCallback, useEffect, useRef, useState } from 'react'

import { ContractCallResult, ConvertTokenPayStage } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useTokenApproveAndPay from './useTokenApproveAndPay'
import useTokenConvert from './useTokenConvert'
import { useExchangeRate, useTokens } from '../../states/settings/hook'
import { currencyToTokenAmount, findToken } from '../utils'
import { ServiceError } from '../../types/errors/service-error'

export default function useTokenConvertAndTokenPay(): ContractCallResult<PaymentDetails> {
  const statusRef = useRef<ApiRequestStatus>('idle')
  const stageRef = useRef<ConvertTokenPayStage | undefined>(undefined)
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
    error: tokenPayError,
    status: tokenPayStatus,
    details: tokenPayDetails,
    txId: tokenPayTxId,
    handle: tokenPayHandle
  } = useTokenApproveAndPay()

  const tokenConvertSuccessHandler = useCallback(() => {
    if (!paymentDetailsRef.current || !tokens || !exchangeRate) {
      setError(new ServiceError('Unexpected error happens', 'common.errors.unexpected'))
      setStatus('error')

      return
    }

    stageRef.current = ConvertTokenPayStage.TokenPay

    const toToken = findToken(tokens, paymentDetailsRef.current.toBlockchain, paymentDetailsRef.current.toToken.symbol, paymentDetailsRef.current.toToken.address)
    if (!toToken?.usdPrice) {
      setError(new ServiceError('Unexpected error happens', 'common.errors.unexpected'))
      setStatus('error')

      return
    }

    const toTokenAmount  = currencyToTokenAmount(paymentDetailsRef.current.currencyAmount, toToken.usdPrice, toToken.decimals, exchangeRate)

    tokenPayHandle({
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
  }, [exchangeRate, tokens, tokenPayHandle])

  const handle = useCallback((paymentDetails: PaymentDetails) => {
    if (statusRef.current === 'processing') {
      return
    }
    statusRef.current = 'processing'
    stageRef.current = ConvertTokenPayStage.TokenConvert
    paymentDetailsRef.current = paymentDetails

    setError(undefined)
    setDetails(undefined)
    setStage(undefined)
    setTxId(undefined)
    setStatus('idle')

    tokenConvertHandle(paymentDetails)
  }, [tokenConvertHandle])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== ConvertTokenPayStage.TokenConvert) {
      return
    }

    switch (tokenConvertStatus) {
      case 'processing':
        setError(undefined)
        setStage(ConvertTokenPayStage.TokenConvert)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('processing')
        break
      case 'error':
        setError(tokenConvertError)
        setStage(ConvertTokenPayStage.TokenConvert)
        setDetails(tokenConvertDetails)
        setTxId(tokenConvertTxId)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setStage(ConvertTokenPayStage.TokenConvert)
        setTxId(tokenConvertTxId)
        setDetails(tokenConvertDetails)
        setStatus('processing')

        tokenConvertSuccessHandler()

        break
    }
  }, [tokenConvertTxId, tokenConvertError, tokenConvertStatus, tokenConvertDetails, tokenConvertSuccessHandler])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== ConvertTokenPayStage.TokenPay) {
      return
    }

    switch (tokenPayStatus) {
      case 'processing':
        setError(undefined)
        setStage(ConvertTokenPayStage.TokenPay)
        setDetails(tokenPayDetails)
        setTxId(tokenPayTxId)
        setStatus('processing')
        break
      case 'error':
        setError(tokenPayError)
        setStage(ConvertTokenPayStage.TokenPay)
        setDetails(tokenPayDetails)
        setTxId(tokenPayTxId)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setStage(ConvertTokenPayStage.TokenPay)
        setDetails(tokenPayDetails)
        setTxId(tokenPayTxId)
        setStatus('success')
        statusRef.current = 'success'
        break
    }
  }, [tokenPayTxId, tokenPayError, tokenPayStatus, tokenPayDetails])

  return {
    status,
    stage,
    details,
    error,
    txId,
    handle
  }
}
