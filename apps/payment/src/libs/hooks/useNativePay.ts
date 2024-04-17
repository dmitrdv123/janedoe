import { PaymentDetails } from '../../types/payment-details'
import { ContractCallResult } from '../../types/contract-call-result'
import { encodeStringToBytes, getAddressOrDefault, tryParseInt } from '../utils'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useNativePay(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (txId: string | undefined) => void
): ContractCallResult {
  const { status, data, txId, error, handle } = useWriteAndWaitContract(
    tryParseInt(paymentDetails.fromBlockchain.chainId),
    getAddressOrDefault(paymentDetails.fromContracts.JaneDoe),
    'payNativeFrom',
    [
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
    [
      getAddressOrDefault(paymentDetails.fromAddress), // from
      getAddressOrDefault(paymentDetails.toAddress), // to
      encodeStringToBytes(paymentDetails.protocolPaymentId) // paymentId
    ],
    BigInt(paymentDetails.tokenAmount),
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
