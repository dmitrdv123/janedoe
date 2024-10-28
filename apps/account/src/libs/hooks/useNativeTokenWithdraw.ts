import { useCallback } from 'react'
import { BlockchainMeta } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import useJanedoeContractWrite from './useJanedoeContractWrite'
import { encodeStringToBytes } from '../utils'

export default function useNativeTokenWithdraw(
  blockchain: BlockchainMeta,
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
    'withdrawEthTo',
    [
      address, // to
      amount, // amount
      encodeStringToBytes('') // paymentId
    ],
    undefined,
    onError,
    onSuccess,
    onProcessing,
  )

  const handleCallback = useCallback(() => {
    if (!address || amount <= 0) {
      return
    }

    handle()
  }, [address, amount, handle])

  return {
    status,
    data,
    txId,
    error,
    handle: handleCallback
  }
}
