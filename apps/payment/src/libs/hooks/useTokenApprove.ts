import { useCallback, useState } from 'react'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { getAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useTokenApprove(
  blockchain: BlockchainMeta,
  token: Token,
  spender: string,
  amount: string,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const [stage, setStage] = useState<string | undefined>(undefined)

  const { status, details, txId, error, handle: contractHandler } = useWriteAndWaitContract(
    tryParseInt(blockchain.chainId),
    getAddressOrDefault(token.address),
    'approve',
    [
      {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
          {
            type: 'address',
          },
          {
            type: 'uint256',
          },
        ],
        outputs: []
      }
    ],
    [
      getAddressOrDefault(spender),
      BigInt(amount)
    ],
    undefined,
    onError,
    onSuccess
  )

  const handle = useCallback(() => {
    setStage('hooks.token_approve.token_approve')
    contractHandler()
  }, [contractHandler])

  return {
    status,
    stage,
    details,
    txId,
    error,
    handle
  }
}
