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
  const currentStatus = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { isConnected, chainId: currentChainId } = useAccount()
  const { t } = useTranslation()

  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { data: txId, status: writeContractStatus, error: writeContractError, writeContract } = useWriteContract()
  const { status: waitForTransactionReceiptStatus } = useWaitForTransactionReceipt({ chainId, hash: txId })

  useEffect(() => {
    if (writeContractStatus === 'success' && waitForTransactionReceiptStatus === 'success') {
      setError(undefined)
      setData(undefined)
      setStatus('success')
      return
    }

    if (writeContractStatus === 'success' && waitForTransactionReceiptStatus === 'error') {
      setError(undefined)
      setData(t('hooks.write_and_wait_contract.transaction_waiting_error', { txId }))
      return
    }

    if (writeContractStatus === 'success' && waitForTransactionReceiptStatus === 'pending') {
      setError(undefined)
      setData(t('hooks.write_and_wait_contract.transaction_waiting', { txId }))
      return
    }

    if (writeContractStatus === 'success') {
      setError(undefined)
      setData(t('hooks.write_and_wait_contract.transaction_confirmed'))
      return
    }

    if (writeContractStatus === 'error') {
      setError(writeContractError)
      setData(undefined)
      setStatus('error')
      return
    }

    if (writeContractStatus === 'pending') {
      setError(undefined)
      setData(t('hooks.write_and_wait_contract.transaction_confirming'))
      return
    }

    if (switchChainStatus === 'success') {
      setError(undefined)
      setData(t('hooks.write_and_wait_contract.switch_chain_confirmed'))
      return
    }

    if (switchChainStatus === 'error') {
      setError(switchChainError)
      setData(undefined)
      setStatus('error')
      return
    }

    if (switchChainStatus === 'pending') {
      setError(undefined)
      setData(t('hooks.write_and_wait_contract.switch_chain_confirming'))
      return
    }
  }, [txId, switchChainError, switchChainStatus, t, waitForTransactionReceiptStatus, writeContractError, writeContractStatus])

  useEffect(() => {
    if (currentStatus.current === status) {
      return
    }
    currentStatus.current = status

    if (status === 'success') {
      onSuccess?.(txId)
    }

    if (status === 'error') {
      onError?.(error)
    }
  }, [error, txId, status, onSuccess, onError])

  const handle = useCallback(() => {
    setError(undefined)
    setData(undefined)
    setStatus('idle')

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

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}
