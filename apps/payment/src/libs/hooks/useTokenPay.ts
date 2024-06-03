import { useCallback, useState } from 'react'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { encodeStringToBytes, getAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useTokenPay(): ContractCallResult<{
  blockchain: BlockchainMeta,
  token: Token,
  janeDoe: string,
  from: string,
  to: string,
  amount: string,
  paymentId: string,
}> {
  const [stage, setStage] = useState<string | undefined>(undefined)

  const { status, details, txId, error, handle: contractHandler } = useWriteAndWaitContract()

  const handle = useCallback((t: {
    blockchain: BlockchainMeta,
    token: Token,
    janeDoe: string,
    from: string,
    to: string,
    amount: string,
    paymentId: string
  }) => {
    const { blockchain, token, janeDoe, from, to, amount, paymentId } = t

    setStage('hooks.token_pay.token_pay')

    contractHandler({
      chainId: tryParseInt(blockchain.chainId),
      address: getAddressOrDefault(janeDoe),
      functionName: 'payFrom',
      abi: [
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
      args: [
        getAddressOrDefault(from),
        getAddressOrDefault(to),
        getAddressOrDefault(token.address),
        BigInt(amount),
        encodeStringToBytes(paymentId)
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
