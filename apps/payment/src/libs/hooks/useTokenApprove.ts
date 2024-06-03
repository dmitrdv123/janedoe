import { useCallback, useState } from 'react'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { getAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useTokenApprove(): ContractCallResult<{
  blockchain: BlockchainMeta,
  token: Token,
  spender: string,
  amount: string
}> {
  const [stage, setStage] = useState<string | undefined>(undefined)

  const { status, details, txId, error, handle: contractHandler } = useWriteAndWaitContract()

  const handle = useCallback((t: {
    blockchain: BlockchainMeta,
    token: Token,
    spender: string,
    amount: string
  }) => {
    const {blockchain, token, spender, amount} = t

    setStage('hooks.token_approve.token_approve')

    contractHandler({
      chainId: tryParseInt(blockchain.chainId),
      address: getAddressOrDefault(token.address),
      functionName: 'approve',
      abi: [
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
      args: [
        getAddressOrDefault(spender),
        BigInt(amount)
      ]
    })
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
