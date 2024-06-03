import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

import { getAddressOrDefault } from '../utils'
import { ApiRequestStatus } from '../../types/api-request'
import { ServiceError } from '../../types/errors/service-error'

export default function useTokenAllowance() {
  const statusRef = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [stage, setStage] = useState<string | undefined>(undefined)
  const [details, setDetails] = useState<string | undefined>(undefined)
  const [allowance, setAllowance] = useState<bigint | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<{
    chainId: number,
    address: Address,
    functionName: 'allowance',
    abi: [
      {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
          {
            name: 'owner',
            type: 'address',
          },
          {
            name: 'spender',
            type: 'address',
          },
        ],
        outputs: [
          {
            type: 'uint256',
          },
        ],
      }
    ],
    args: [`0x${string}`, `0x${string}`]
  } | undefined>(undefined)

  const { t } = useTranslation()

  const {
    status: readStatus,
    refetch: readHandler
  } = useReadContract(data)

  const handle = useCallback((
    blockchain: BlockchainMeta,
    token: Token,
    from: string,
    to: string,
  ) => {
    if (statusRef.current === 'processing' || !blockchain.chainId) {
      return
    }
    statusRef.current = 'processing'

    setError(undefined)
    setStage(undefined)
    setDetails(undefined)
    setData({
      chainId: parseInt(blockchain.chainId),
      address: getAddressOrDefault(token.address),
      functionName: 'allowance',
      abi: [
        {
          type: 'function',
          name: 'allowance',
          stateMutability: 'view',
          inputs: [
            {
              name: 'owner',
              type: 'address',
            },
            {
              name: 'spender',
              type: 'address',
            },
          ],
          outputs: [
            {
              type: 'uint256',
            },
          ],
        }
      ],
      args: [
        getAddressOrDefault(from),
        getAddressOrDefault(to)
      ]
    })
    setStatus('processing')
  }, [])

  useEffect(() => {
    const reload = async () => {
      setError(undefined)
      setDetails(t('hooks.token_allowance.read_allowance_processing'))
      setStage('hooks.token_allowance.read_allowance')
      setAllowance(undefined)
      setStatus('processing')

      const {
        status: tokenAllowanceStatus,
        data: allowance,
        error: tokenAllowanceError,
      } = await readHandler()

      switch (tokenAllowanceStatus) {
        case 'error': {
          const err = new ServiceError(tokenAllowanceError?.shortMessage ?? '', 'services.errors.payment_errors.read_allowance_error')

          setError(err)
          setDetails(t('hooks.token_allowance.read_allowance_error'))
          setStage('hooks.token_allowance.read_allowance')
          setAllowance(undefined)
          setStatus('error')

          statusRef.current = 'error'
          break
        }
        case 'success':
          setError(undefined)
          setDetails(t('hooks.token_allowance.read_allowance_success'))
          setStage('hooks.token_allowance.read_allowance')
          setAllowance(allowance)
          setStatus('success')

          statusRef.current = 'success'
          break
      }
    }

    if (statusRef.current === 'processing' && data) {
      reload()
    }
  }, [readStatus, status, data, t, readHandler])

  return {
    status,
    stage,
    details,
    error,
    allowance,
    handle
  }
}
