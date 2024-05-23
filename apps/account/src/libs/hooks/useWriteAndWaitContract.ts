import { useCallback, useEffect, useState } from 'react'
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
  onProcessing?: () => void
): ContractCallResult {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { isConnected, chainId: currentChainId } = useAccount()
  const { t } = useTranslation()

  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { data: txId, status: writeContractStatus, error: writeContractError, writeContract } = useWriteContract()
  const { status: waitForTransactionReceiptStatus, error: waitForTransactionReceiptError } = useWaitForTransactionReceipt({ chainId, hash: txId })

  useEffect(() => {
    const err = waitForTransactionReceiptError ? new Error(waitForTransactionReceiptError.message) : undefined

    switch (waitForTransactionReceiptStatus) {
      case 'success':
        setError(undefined)
        setData(t('hooks.write_and_wait_contract.transaction_waiting_success', { txId }))
        setStatus('success')

        onSuccess?.(txId)
        break
      case 'error':
        setError(err)
        setData(t('hooks.write_and_wait_contract.transaction_waiting_error', { txId }))

        onError?.(err)
        break
      case 'pending':
        setError(undefined)
        setData(t('hooks.write_and_wait_contract.transaction_waiting', { txId }))
        break
    }
  }, [t, txId, waitForTransactionReceiptStatus, waitForTransactionReceiptError, onSuccess, onError])

  useEffect(() => {
    const err = writeContractError ? new Error(writeContractError.message) : undefined

    switch (writeContractStatus) {
      case 'success':
        setError(undefined)
        setData(t('hooks.write_and_wait_contract.transaction_confirmed'))
        break
      case 'error':
        setError(err)
        setData(t('hooks.write_and_wait_contract.transaction_confirming_error'))
        setStatus('error')

        onError?.(err)
        break
      case 'pending':
        setError(undefined)
        setData(t('hooks.write_and_wait_contract.transaction_confirming'))
        break
    }
  }, [t, writeContractError, writeContractStatus, onError])

  useEffect(() => {
    const err = switchChainError ? new Error(switchChainError.message) : undefined

    switch (switchChainStatus) {
      case 'success':
        setError(undefined)
        setData(t('hooks.write_and_wait_contract.switch_chain_confirmed'))
        break
      case 'error':
        setError(err)
        setData(t('hooks.write_and_wait_contract.switch_chain_error'))
        setStatus('error')

        onError?.(err)
        break
      case 'pending':
        setError(undefined)
        setData(t('hooks.write_and_wait_contract.switch_chain_confirming'))
        break
    }
  }, [switchChainError, switchChainStatus, t, onError])

  const handle = useCallback(() => {
    setError(undefined)
    setData(undefined)
    setStatus('idle')

    if (!isConnected || chainId === undefined || !address) {
      return
    }

    setStatus('processing')
    onProcessing?.()

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
  }, [abi, address, args, chainId, currentChainId, functionName, isConnected, value, switchChain, writeContract, onProcessing])

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}
