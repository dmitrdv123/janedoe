import { useCallback, useState } from 'react'

import { PaymentDetails } from '../../types/payment-details'
import { ContractCallResult, NativePayStage } from '../../types/contract-call-result'
import { encodeStringToBytes, getAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useNativePay(): ContractCallResult<PaymentDetails> {
  const [stage, setStage] = useState<string | undefined>(undefined)

  const { status, details, txId, error, handle: contractHandler } = useWriteAndWaitContract()

  const handle = useCallback((paymentDetails: PaymentDetails) => {
    setStage(NativePayStage.NativePay)

    contractHandler({
      chainId: tryParseInt(paymentDetails.fromBlockchain.chainId),
      address: getAddressOrDefault(paymentDetails.fromContracts.JaneDoe),
      functionName: 'payNativeFrom',
      abi: [
        {
          name: 'payNativeFrom',
          type: 'function',
          stateMutability: 'payable',
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
              internalType: 'bytes',
              name: 'paymentId',
              type: 'bytes'
            }
          ],
          outputs: []
        },
      ],
      args: [
        getAddressOrDefault(paymentDetails.fromAddress), // from
        getAddressOrDefault(paymentDetails.toAddress), // to
        encodeStringToBytes(paymentDetails.protocolPaymentId) // paymentId
      ],
      value: BigInt(paymentDetails.fromTokenAmount)
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
