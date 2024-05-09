import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

import { getAddressOrDefault, getTronAddressOrDefault, tryParseInt } from '../utils'
import { ApiRequestStatus } from '../../types/api-request'

export default function useTokenAllowance(
  blockchain: BlockchainMeta,
  token: Token,
  from: string,
  to: string,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (allowance: bigint | undefined) => void
) {
  const currentStatus = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()

  const {
    status: tokenAllowanceStatus,
    data: allowance,
    error: tokenAllowanceError,
    refetch: handle
  } = useReadContract({
    chainId: tryParseInt(blockchain.chainId),
    address: blockchain.type === TransactionType.TRON
      ? getTronAddressOrDefault(token.address)
      : getAddressOrDefault(token.address),
    functionName: 'allowance',
    abi: erc20Abi,
    args: [
      getAddressOrDefault(from),
      getAddressOrDefault(to)
    ]
  })

  useEffect(() => {
    if (tokenAllowanceStatus === 'success') {
      setError(undefined)
      setStatus('success')
      return
    }

    if (tokenAllowanceStatus === 'error') {
      setError(tokenAllowanceError)
      setStatus('error')
      return
    }

    if (tokenAllowanceStatus === 'pending') {
      setError(undefined)
      setStatus('processing')
      return
    }
  }, [t, tokenAllowanceError, tokenAllowanceStatus])

  useEffect(() => {
    if (currentStatus.current === status) {
      return
    }

    currentStatus.current = status

    if (status === 'error') {
      onError?.(error)
    }

    if (status === 'success') {
      onSuccess?.(allowance)
    }
  }, [status, allowance, error, onError, onSuccess])

  return {
    status,
    allowance,
    error,
    handle
  }
}
