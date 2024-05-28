import { EvmTransaction, SwapResponse } from 'rango-sdk-basic'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContractCallResult, TokenConvertStage } from '../../types/contract-call-result'
import { PaymentDetails } from '../../types/payment-details'
import { ApiRequestStatus } from '../../types/api-request'
import useTokenConvertSwap from './useTokenConvertSwap'
import useTokenConvertTransactionApproval from './useTokenConvertTransactionApproval'
import useTokenConvertTransactionMain from './useTokenConvertTransactionMain'
import { useAccount, useSwitchChain } from 'wagmi'
import { tryParseInt } from '../utils'

export default function useTokenConvert(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)
  const [evmTx, setEvmTx] = useState<EvmTransaction | undefined>(undefined)

  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { chainId: currentChainId } = useAccount()
  const { t } = useTranslation()

  const {
    status: mainStatus,
    error: mainError,
    handle: mainHandle
  } = useTokenConvertTransactionMain(
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
  } = useTokenConvertTransactionApproval(
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
      switchChain({ chainId }, { onSuccess: () => execTx(data.requestId, evmTransaction) })
    } else {
      execTx(data.requestId, evmTransaction)
    }
  }, [currentChainId, approveHandle, mainHandle, switchChain])

  const {
    status: swapStatus,
    error: swapError,
    handle: swapHandle
  } = useTokenConvertSwap(paymentDetails, onError, swapSuccessHandler)

  const handle = useCallback(() => {
    setError(undefined)
    setStage(undefined)
    setDetails(undefined)
    setEvmTx(undefined)
    setRequestId(undefined)
    setStatus('idle')

    swapHandle()
  }, [swapHandle])

  useEffect(() => {
    const err = switchChainError ? new Error(switchChainError.message) : undefined

    switch (switchChainStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.token_convert.switch_chain_processing'))
        setStage(TokenConvertStage.SwitchChain)
        setStatus('processing')
        break
      case 'error':
        setError(err)
        setDetails(t('hooks.token_convert.switch_chain_error'))
        setStatus('error')

        onError?.(err)
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.switch_chain_success'))
        break
    }
  }, [switchChainError, switchChainStatus, t, onError])

  useEffect(() => {
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
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_swap_success'))
        break
    }
  }, [swapError, swapStatus, t])

  useEffect(() => {
    switch (approveStatus) {
      case 'processing':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_approve_processing'))
        setStage(TokenConvertStage.TokenApprove)
        setStatus('processing')
        break
      case 'error':
        setError(approveError)
        setDetails(t('hooks.token_convert.token_approve_error'))
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_approve_success'))
        break
    }
  }, [approveError, approveStatus, t])

  useEffect(() => {
    switch (mainStatus) {
      case 'processing':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_convert_processing'))
        setStage(TokenConvertStage.TokenConvert)
        setStatus('processing')
        break
      case 'error':
        setError(mainError)
        setDetails(t('hooks.token_convert.token_convert_error'))
        setStatus('error')
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_convert.token_convert_success'))
        setStatus('success')
        break
    }
  }, [mainError, mainStatus, t])

  return {
    status,
    stage,
    details,
    error,
    txId: requestId,
    handle
  }
}
