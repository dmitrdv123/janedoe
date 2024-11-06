import { EvmTransaction, SwapResponse } from 'rango-sdk-basic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContractCallResult, TokenConvertStage } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useTokenConvertSwap from './useTokenConvertSwap'
import useTokenConvertTransactionApproval from './useTokenConvertTransactionApproval'
import useTokenConvertTransactionMain from './useTokenConvertTransactionMain'
import { useAccount, useSwitchChain } from 'wagmi'
import { tryParseInt } from '../utils'

export default function useTokenConvert(): ContractCallResult<PaymentDetails> {
  const statusRef = useRef<ApiRequestStatus>('idle')
  const stageRef = useRef<string | undefined>(undefined)
  const evmTxRef = useRef<EvmTransaction | undefined>(undefined)
  const requestIdRef = useRef<string | undefined>(undefined)

  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)

  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { chainId: currentChainId } = useAccount()
  const { t } = useTranslation()

  const {
    status: swapStatus,
    error: swapError,
    data: swapData,
    handle: swapHandle
  } = useTokenConvertSwap()

  const {
    status: approveStatus,
    error: approveError,
    data: approveData,
    handle: approveHandle
  } = useTokenConvertTransactionApproval()

  const {
    status: mainStatus,
    error: mainError,
    data: mainData,
    handle: mainHandle
  } = useTokenConvertTransactionMain()

  const swapSuccessHandler = useCallback((data: SwapResponse | undefined) => {
    const execTx = (requestIdToUse: string | undefined, evmTxToUse: EvmTransaction | undefined) => {
      if (evmTxToUse?.approveTo && evmTxToUse.approveData) {
        stageRef.current = TokenConvertStage.TokenApprove
        approveHandle(requestIdToUse, evmTxToUse)
      } else {
        stageRef.current = TokenConvertStage.TokenConvert
        mainHandle(requestIdToUse, evmTxToUse)
      }
    }

    if (!data) {
      return
    }

    const evmTransaction = data.tx as EvmTransaction

    requestIdRef.current = data.requestId
    evmTxRef.current = evmTransaction
    setRequestId(data.requestId)

    const chainId = tryParseInt(evmTransaction.blockChain.chainId)
    if (chainId && currentChainId !== chainId) {
      stageRef.current = TokenConvertStage.SwitchChain
      switchChain({ chainId }, { onSuccess: () => execTx(data.requestId, evmTransaction) })
    } else {
      execTx(data.requestId, evmTransaction)
    }
  }, [currentChainId, approveHandle, mainHandle, switchChain])

  const approveSuccessHandler = useCallback(() => {
    stageRef.current = TokenConvertStage.TokenConvert
    mainHandle(requestIdRef.current, evmTxRef.current)
  }, [mainHandle])

  const handle = useCallback((paymentDetails: PaymentDetails) => {
    if (statusRef.current === 'processing') {
      return
    }
    statusRef.current = 'processing'
    stageRef.current = TokenConvertStage.TokenSwap
    requestIdRef.current = undefined
    evmTxRef.current = undefined

    setError(undefined)
    setStage(undefined)
    setDetails(undefined)
    setRequestId(undefined)
    setStatus('idle')

    swapHandle(paymentDetails)
  }, [swapHandle])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenConvertStage.TokenSwap) {
      return
    }

    switch (swapStatus) {
      case 'processing':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_swap_processing'))
        setStage(TokenConvertStage.TokenSwap)
        setStatus('processing')
        break
      case 'error':
        setError(swapError)
        setDetails(t('hooks.token_convert.token_swap_error'))
        setStage(TokenConvertStage.TokenSwap)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_swap_success'))
        setStage(TokenConvertStage.TokenSwap)
        setStatus('processing')

        swapSuccessHandler(swapData)

        break
    }
  }, [swapData, swapError, swapStatus, t, swapSuccessHandler])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenConvertStage.SwitchChain) {
      return
    }


    switch (switchChainStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.token_convert.switch_chain_processing'))
        setStage(TokenConvertStage.SwitchChain)
        setStatus('processing')
        break
      case 'error': {
        const err = switchChainError ? new Error(switchChainError.message) : undefined

        setError(err)
        setDetails(t('hooks.token_convert.switch_chain_error'))
        setStage(TokenConvertStage.SwitchChain)
        setStatus('error')
        statusRef.current = 'error'
        break
      }
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.switch_chain_success'))
        setStage(TokenConvertStage.SwitchChain)
        setStatus('processing')
        break
    }
  }, [switchChainError, switchChainStatus, t])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenConvertStage.TokenApprove) {
      return
    }

    switch (approveStatus) {
      case 'processing':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_approve_processing'))
        setStage(TokenConvertStage.TokenApprove)
        setStatus('processing')
        break
      case 'error':
        setError(approveError)
        setDetails(approveData)
        setStage(TokenConvertStage.TokenApprove)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_approve_success'))
        setStage(TokenConvertStage.TokenApprove)
        setStatus('processing')

        approveSuccessHandler()

        break
    }
  }, [approveError, approveStatus, approveData, t, approveSuccessHandler])

  useEffect(() => {
    if (statusRef.current !== 'processing' || stageRef.current !== TokenConvertStage.TokenConvert) {
      return
    }

    switch (mainStatus) {
      case 'processing':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_convert_processing'))
        setStage(TokenConvertStage.TokenConvert)
        setStatus('processing')
        break
      case 'error':
        setError(mainError)
        setDetails(mainData)
        setStage(TokenConvertStage.TokenConvert)
        setStatus('error')
        statusRef.current = 'error'
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_convert_success'))
        setStage(TokenConvertStage.TokenConvert)
        setStatus('success')
        statusRef.current = 'success'
        break
    }
  }, [mainError, mainStatus, mainData, t])

  return {
    status,
    stage,
    details,
    error,
    txId: requestId,
    handle
  }
}
