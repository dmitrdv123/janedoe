import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Abi, Address } from 'viem'
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { ContractCallResult } from '../../types/contract-call-result'
import { ApiRequestStatus } from '../../types/api-request'

export default function useWriteAndWaitContract(
  chainId: number | undefined,
  address: Address | undefined,
  functionName: string,
  abi: Abi,
  args?: unknown[],
  value?: bigint,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void,
): ContractCallResult {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const isDoneRef = useRef(false)

  const { isConnected, chainId: currentChainId } = useAccount()
  const { t } = useTranslation()

  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { data: txId, status: writeContractStatus, error: writeContractError, writeContract } = useWriteContract()
  const { status: waitForTransactionReceiptStatus, error: waitForTransactionReceiptError } = useWaitForTransactionReceipt({ chainId, hash: txId })

  const handle = useCallback(() => {
    setError(undefined)
    setStage(undefined)
    setDetails(undefined)
    setStatus('idle')
    isDoneRef.current = false

    if (!isConnected || chainId === undefined || !address) {
      return
    }

    setStatus('processing')

    if (chainId !== currentChainId) {
      switchChain({ chainId }, {
        onSuccess: () => writeContract({
          chainId,
          address,
          functionName,
          abi,
          args,
          value
        })
      })
    } else {
      writeContract({
        chainId,
        address,
        functionName,
        abi,
        args,
        value,
      })
    }
  }, [abi, address, args, chainId, currentChainId, functionName, isConnected, value, switchChain, writeContract])

  useEffect(() => {
    const err = switchChainError ? new Error(switchChainError.message) : undefined
    switch (switchChainStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.switch_chain_processing'))
        setStage('hooks.write_and_wait_contract.switch_chain')
        break
      case 'error':
        setError(err)
        setDetails(t('hooks.write_and_wait_contract.switch_chain_error'))
        setStatus('error')

        if (!isDoneRef.current) {
          isDoneRef.current = true
          onError?.(err)
        }
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.switch_chain_success'))
        break
    }
  }, [switchChainError, switchChainStatus, t, onError])

  useEffect(() => {
    const err = writeContractError ? new Error(writeContractError.message) : undefined
    switch (writeContractStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_confirm_processing'))
        setStage('hooks.write_and_wait_contract.transaction_confirm')
        break
      case 'error':
        setError(err)
        setDetails(t('hooks.write_and_wait_contract.transaction_confirm_error'))
        setStatus('error')

        if (!isDoneRef.current) {
          isDoneRef.current = true
          onError?.(err)
        }
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_confirm_success'))
        break
    }
  }, [t, writeContractError, writeContractStatus, onError])

  useEffect(() => {
    const err = waitForTransactionReceiptError ? new Error(waitForTransactionReceiptError.message) : undefined
    switch (waitForTransactionReceiptStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_wait_processing', { txId }))
        setStage('hooks.write_and_wait_contract.transaction_wait')
        break
      case 'error':
        setError(err)
        setDetails(t('hooks.write_and_wait_contract.transaction_wait_error', { txId }))
        setStatus('error')

        if (!isDoneRef.current) {
          isDoneRef.current = true
          onError?.(err)
        }
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_wait_success', { txId }))
        setStatus('success')

        if (!isDoneRef.current) {
          isDoneRef.current = true
          onSuccess?.(txId)
        }
        break
    }
  }, [t, txId, waitForTransactionReceiptError, waitForTransactionReceiptStatus, onError, onSuccess])

  return {
    status,
    stage,
    details,
    txId,
    error,
    handle
  }
}
