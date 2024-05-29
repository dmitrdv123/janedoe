import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

import { getAddressOrDefault, tryParseInt } from '../utils'
import { ApiRequestStatus } from '../../types/api-request'
import { ServiceError } from '../../types/errors/service-error'

export default function useTokenAllowance(
  blockchain: BlockchainMeta,
  token: Token,
  from: string,
  to: string,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (allowance: bigint | undefined) => void
) {
  const statusRef = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()

  const {
    status: tokenAllowanceStatus,
    data: allowance,
    error: tokenAllowanceError,
    refetch: readHandler
  } = useReadContract({
    chainId: tryParseInt(blockchain.chainId),
    address: getAddressOrDefault(token.address),
    functionName: 'allowance',
    abi: erc20Abi,
    args: [
      getAddressOrDefault(from),
      getAddressOrDefault(to)
    ]
  })

  const handle = useCallback(() => {
    if (statusRef.current === 'processing') {
      return
    }

    statusRef.current = 'processing'

    setError(undefined)
    setStage(undefined)
    setDetails(undefined)
    setStatus('idle')

    readHandler()
  }, [readHandler])

  useEffect(() => {
    const err = new ServiceError(tokenAllowanceError?.shortMessage ?? '', 'services.errors.payment_errors.read_allowance_error')

    switch (tokenAllowanceStatus) {
      case 'pending':
        setError(undefined)
        setDetails(t('hooks.token_allowance.read_allowance_processing'))
        setStage('hooks.token_allowance.read_allowance')
        setStatus('processing')
        break
      case 'error':

        setError(err)
        setDetails(t('hooks.token_allowance.read_allowance_error'))
        setStatus('error')

        if (statusRef.current !== 'error') {
          statusRef.current = 'error'
          onError?.(err)
        }
        break
      case 'success':
        setError(undefined)
        setDetails(t('hooks.token_allowance.read_allowance_success'))
        setStatus('success')

        if (statusRef.current !== 'success') {
          statusRef.current = 'success'
          onSuccess?.(allowance)
        }
        break
    }
  }, [allowance, tokenAllowanceError, tokenAllowanceStatus, t, onError, onSuccess])

  return {
    status,
    stage,
    details,
    error,
    allowance,
    handle
  }
}
