import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Abi, Address } from 'viem'
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { ContractCallResult } from '../../types/contract-call-result'
import { ApiRequestStatus } from '../../types/api-request'

export default function useWriteAndWaitContract(): ContractCallResult<{
  chainId: number | undefined,
  address: Address | undefined,
  functionName: string,
  abi: Abi,
  args?: unknown[],
  value?: bigint
}> {
  const statusRef = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [chainId, setChainId] = useState<number | undefined>(undefined)

  const { status: connectStatus, chainId: currentChainId } = useAccount()
  const { t } = useTranslation()

  const { status: switchChainStatus, error: switchChainError, switchChain } = useSwitchChain()
  const { data: txId, status: writeContractStatus, error: writeContractError, writeContract } = useWriteContract()
  const { status: waitForTransactionReceiptStatus, error: waitForTransactionReceiptError } = useWaitForTransactionReceipt({ chainId, hash: txId })

  const handle = useCallback((t: {
    chainId: number | undefined,
    address: Address | undefined,
    functionName: string,
    abi: Abi,
    args?: unknown[],
    value?: bigint,
  }) => {
    const { chainId: chainIdToUse, address, functionName, abi, args, value } = t

    if (statusRef.current === 'processing' || connectStatus !== 'connected' || chainIdToUse === undefined || !address) {
      return
    }
    statusRef.current = 'processing'

    setError(undefined)
    setStage(undefined)
    setDetails(undefined)
    setChainId(chainIdToUse)
    setStatus('processing')

    if (chainIdToUse !== currentChainId) {
      switchChain({ chainId: chainIdToUse }, {
        onSuccess: () => writeContract({
          address,
          functionName,
          abi,
          args,
          value,
          chainId: chainIdToUse,
        })
      })
    } else {
      writeContract({
        address,
        functionName,
        abi,
        args,
        value,
        chainId: chainIdToUse
      })
    }
  }, [connectStatus, currentChainId, switchChain, writeContract])

  useEffect(() => {
    if (statusRef.current !== 'processing') {
      return
    }


    switch (switchChainStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.switch_chain_processing'))
        setStage('hooks.write_and_wait_contract.switch_chain')
        setStatus('processing')
        break
      case 'error': {
        const err = switchChainError ? new Error(switchChainError.message) : undefined

        setError(err)
        setDetails(t('hooks.write_and_wait_contract.switch_chain_error'))
        setStage('hooks.write_and_wait_contract.switch_chain')
        setStatus('error')

        statusRef.current = 'error'
        break
      }
      case 'success':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.switch_chain_success'))
        setStage('hooks.write_and_wait_contract.switch_chain')
        setStatus('processing')
        break
    }
  }, [switchChainError, switchChainStatus, t])

  useEffect(() => {
    if (statusRef.current !== 'processing') {
      return
    }


    switch (writeContractStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_confirm_processing'))
        setStage('hooks.write_and_wait_contract.transaction_confirm')
        setStatus('processing')
        break
      case 'error': {
        const err = writeContractError ? new Error(writeContractError.message) : undefined

        setError(err)
        setDetails(t('hooks.write_and_wait_contract.transaction_confirm_error'))
        setStage('hooks.write_and_wait_contract.transaction_confirm')
        setStatus('error')

        statusRef.current = 'error'
        break
      }
      case 'success':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_confirm_success'))
        setStage('hooks.write_and_wait_contract.transaction_confirm')
        setStatus('processing')
        break
    }
  }, [t, writeContractError, writeContractStatus])

  useEffect(() => {
    if (statusRef.current !== 'processing') {
      return
    }

    switch (waitForTransactionReceiptStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_wait_processing', { txId }))
        setStage('hooks.write_and_wait_contract.transaction_wait')
        setStatus('processing')
        break
      case 'error': {
        const err = waitForTransactionReceiptError ? new Error(waitForTransactionReceiptError.message) : undefined

        setError(err)
        setDetails(t('hooks.write_and_wait_contract.transaction_wait_error', { txId }))
        setStage('hooks.write_and_wait_contract.transaction_wait')
        setStatus('error')

        statusRef.current = 'error'
        break
      }
      case 'success':
        setError(undefined)
        setDetails(t('hooks.write_and_wait_contract.transaction_wait_success', { txId }))
        setStage('hooks.write_and_wait_contract.transaction_wait')
        setStatus('success')

        statusRef.current = 'success'
        break
    }
  }, [t, txId, waitForTransactionReceiptError, waitForTransactionReceiptStatus])

  return {
    status,
    stage,
    details,
    txId,
    error,
    handle
  }
}
