import { BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { getAddressOrDefault, getTronAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useTokenApprove(
  blockchain: BlockchainMeta,
  token: Token,
  spender: string,
  amount: string,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const { status, data, txId, error, handle } = useWriteAndWaitContract(
    tryParseInt(blockchain.chainId),
    blockchain.type === TransactionType.TRON ? getTronAddressOrDefault(token.address) : getAddressOrDefault(token.address),
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

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}
