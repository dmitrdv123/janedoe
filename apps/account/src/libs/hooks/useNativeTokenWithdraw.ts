import { useCallback } from 'react'
import { BlockchainMeta } from 'rango-sdk-basic'
import { useAccount } from 'wagmi'

import { ContractCallResult } from '../../types/contract-call-result'
import useJanedoeContractWrite from './useJanedoeContractWrite'
import { encodeStringToBytes } from '../utils'

export default function useNativeTokenWithdraw(
  blockchain: BlockchainMeta,
  amount: bigint,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (hash: string | undefined) => void,
  onProcessing?: () => void
): ContractCallResult {
  const { address } = useAccount()

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
