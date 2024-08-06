import { BlockchainMeta } from 'rango-sdk-basic'

import { ContractCallResult } from '../../types/contract-call-result'
import { getAddressOrDefault, tryParseInt } from '../utils'
import { useMemo } from 'react'
import { useSettings } from '../../states/settings/hook'
import useWriteAndWaitContract from './useWriteAndWaitContract'

export default function useJanedoeContractWrite(
  blockchain: BlockchainMeta,
  functionName: string,
  args?: unknown[],
  value?: bigint,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (hash: string | undefined) => void,
  onProcessing?: () => void
): ContractCallResult {
  const appSettings = useSettings()

  const contract = useMemo(() =>
    appSettings.current?.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
    )
    , [appSettings, blockchain]
  )

  const { status, data, txId, error, handle } = useWriteAndWaitContract(
    tryParseInt(blockchain.chainId),
    getAddressOrDefault(contract?.contractAddresses.JaneDoe),
    functionName,
    [
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'account',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': 'id',
            'type': 'uint256'
          }
        ],
        'name': 'balanceOf',
        'outputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address[]',
            'name': 'accounts',
            'type': 'address[]'
          },
          {
            'internalType': 'uint256[]',
            'name': 'ids',
            'type': 'uint256[]'
          }
        ],
        'name': 'balanceOfBatch',
        'outputs': [
          {
            'internalType': 'uint256[]',
            'name': '',
            'type': 'uint256[]'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'account',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'operator',
            'type': 'address'
          }
        ],
        'name': 'isApprovedForAll',
        'outputs': [
          {
            'internalType': 'bool',
            'name': '',
            'type': 'bool'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'from',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'to',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'token',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': 'amount',
            'type': 'uint256'
          },
          {
            'internalType': 'bytes',
            'name': 'paymentId',
            'type': 'bytes'
          }
        ],
        'name': 'payFrom',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'from',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'to',
            'type': 'address'
          },
          {
            'internalType': 'bytes',
            'name': 'paymentId',
            'type': 'bytes'
          }
        ],
        'name': 'payNativeFrom',
        'outputs': [],
        'stateMutability': 'payable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'from',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'to',
            'type': 'address'
          },
          {
            'internalType': 'uint256[]',
            'name': 'ids',
            'type': 'uint256[]'
          },
          {
            'internalType': 'uint256[]',
            'name': 'amounts',
            'type': 'uint256[]'
          },
          {
            'internalType': 'bytes',
            'name': 'data',
            'type': 'bytes'
          }
        ],
        'name': 'safeBatchTransferFrom',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'from',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'to',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': 'id',
            'type': 'uint256'
          },
          {
            'internalType': 'uint256',
            'name': 'amount',
            'type': 'uint256'
          },
          {
            'internalType': 'bytes',
            'name': 'data',
            'type': 'bytes'
          }
        ],
        'name': 'safeTransferFrom',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'operator',
            'type': 'address'
          },
          {
            'internalType': 'bool',
            'name': 'approved',
            'type': 'bool'
          }
        ],
        'name': 'setApprovalForAll',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'bytes4',
            'name': 'interfaceId',
            'type': 'bytes4'
          }
        ],
        'name': 'supportsInterface',
        'outputs': [
          {
            'internalType': 'bool',
            'name': '',
            'type': 'bool'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'uint256',
            'name': '',
            'type': 'uint256'
          }
        ],
        'name': 'uri',
        'outputs': [
          {
            'internalType': 'string',
            'name': '',
            'type': 'string'
          }
        ],
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'to',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': 'amount',
            'type': 'uint256'
          }
        ],
        'name': 'withdrawEthTo',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address',
            'name': 'to',
            'type': 'address'
          },
          {
            'internalType': 'address',
            'name': 'token',
            'type': 'address'
          },
          {
            'internalType': 'uint256',
            'name': 'amount',
            'type': 'uint256'
          }
        ],
        'name': 'withdrawTo',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'inputs': [
          {
            'internalType': 'address[]',
            'name': 'accounts',
            'type': 'address[]'
          },
          {
            'internalType': 'address[]',
            'name': 'tokens',
            'type': 'address[]'
          },
          {
            'internalType': 'uint256[]',
            'name': 'amounts',
            'type': 'uint256[]'
          }
        ],
        'name': 'withdrawToBatch',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC1155InsufficientBalance",
        "type": "error"
      },
    ],
    args,
    value,
    onError,
    onSuccess,
    onProcessing
  )

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}
