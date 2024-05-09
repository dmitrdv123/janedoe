import { BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { encodeStringToBytes, getAddressOrDefault, getTronAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useTokenPay(
  blockchain: BlockchainMeta,
  token: Token,
  janeDoe: string,
  from: string,
  to: string,
  amount: string,
  paymentId: string,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const { status, data, txId, error, handle } = useWriteAndWaitContract(
    tryParseInt(blockchain.chainId),
    getAddressOrDefault(janeDoe),
    'payFrom',
    [
      {
        name: 'payFrom',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          {
            internalType: 'address',
            name: 'from',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'token',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'paymentId',
            type: 'bytes'
          }
        ],
        outputs: [],
      },
    ],
    [
      getAddressOrDefault(from),
      getAddressOrDefault(to),
      blockchain.type === TransactionType.TRON ? getTronAddressOrDefault(token.address) : getAddressOrDefault(token.address),
      BigInt(amount),
      encodeStringToBytes(paymentId)
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
