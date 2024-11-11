import { useCallback } from 'react'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { getAddressOrDefault } from '../utils'
import useJanedoeContractWrite from './useJanedoeContractWrite'

export default function useTokenWithdraw(
  blockchain: BlockchainMeta,
  token: Token,
  amount: bigint,
  address: string,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (hash: string | undefined) => void,
  onProcessing?: () => void
): ContractCallResult {
  const {
    status,
    data,
    error,
    txId,
    handle
  } = useJanedoeContractWrite(
    blockchain,
    'withdrawTo',
    [
      address, // to
      getAddressOrDefault(token.address), // token
      amount // amount
    ],
    undefined,
    onError,
    onSuccess,
    onProcessing,
  )

  const handleCallback = useCallback(() => {
    if (!address || !token.address || amount <= 0) {
      return
    }

    handle()
  }, [address, amount, token.address, handle])

  return {
    status,
    data,
    txId,
    error,
    handle: handleCallback
  }
}
