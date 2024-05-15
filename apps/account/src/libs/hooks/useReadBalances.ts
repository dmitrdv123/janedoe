import { useCallback, useEffect, useMemo, useState } from 'react'
import { useReadContracts } from 'wagmi'
import { BlockchainMeta } from 'rango-sdk-basic'
import { AbiFunction } from 'viem'

import { getAddressOrDefault, isBlockchainToken } from '../utils'
import { useSettings } from '../../states/settings/hook'
import { useTokens } from '../../states/meta/hook'
import { TokenWithId } from '../../types/token-with-id'
import { TokenWithBalance } from '../../types/token-with-balance'
import { ReadBalancesResult } from '../../types/read-balances-result'
import { useAccountRbacSettings } from '../../states/account-settings/hook'
import { ApiRequestStatus } from '../../types/api-request'

const PAGE_SIZE = 50

export default function useReadBalances(blockchain: BlockchainMeta): ReadBalancesResult {
  const [tokenWithBalance, setTokenWithBalance] = useState<TokenWithBalance[] | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')

  const appSettings = useSettings()
  const tokens = useTokens()
  const rbacSettings = useAccountRbacSettings()

  const contracts = useMemo(() => {
    return appSettings.current?.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
    )
  }, [appSettings, blockchain.name])

  const blockchainTokensByChunks = useMemo(() => {
    if (!tokens) {
      return undefined
    }

    const wrappedNativeContractAddress = contracts?.contractAddresses.WrappedNative
    if (!wrappedNativeContractAddress) {
      return undefined
    }

    return tokens
      .filter(token => isBlockchainToken(blockchain, token))
      .map(token => {
        if (token.address) {
          const id = token.address
          return {
            ...token,
            id: BigInt(id)
          } as TokenWithId
        }

        return {
          ...token,
          id: BigInt(wrappedNativeContractAddress)
        } as TokenWithId
      })
      .reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / PAGE_SIZE)

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)

        return resultArray
      }, [] as TokenWithId[][])
  }, [blockchain, tokens, contracts?.contractAddresses.WrappedNative])

  const {
    data: balancesData,
    refetch: balancesRefetch,
    status: balancesStatus,
    error: balancesError
  } = useReadContracts(
    {
      contracts: !!rbacSettings?.ownerAddress && contracts?.contractAddresses.JaneDoe
        ? blockchainTokensByChunks?.map(
          chunk => {
            const abiFunction: AbiFunction = {
              inputs: [
                {
                  internalType: 'address[]',
                  name: 'accounts',
                  type: 'address[]'
                },
                {
                  internalType: 'uint256[]',
                  name: 'ids',
                  type: 'uint256[]'
                }
              ],
              name: 'balanceOfBatch',
              outputs: [
                {
                  internalType: 'uint256[]',
                  name: '',
                  type: 'uint256[]'
                }
              ],
              stateMutability: 'view',
              type: 'function'
            }

            return {
              address: getAddressOrDefault(contracts?.contractAddresses.JaneDoe),
              functionName: 'balanceOfBatch',
              abi: [abiFunction],
              chainId: Number(blockchain.chainId),
              args: [
                Array(chunk?.length).fill(getAddressOrDefault(rbacSettings?.ownerAddress)),
                chunk?.map(token => token.id)
              ]
            }
          }
        )
        : [],
      allowFailure: false
    }
  )

  useEffect(() => {
    if (balancesStatus !== 'success' || !balancesData || !blockchainTokensByChunks) {
      return
    }

    const balancesDataFlat = balancesData.flat()
    const blockchainTokens = blockchainTokensByChunks.flat()
    if (balancesDataFlat.length != blockchainTokens.length) {
      return
    }

    const res = blockchainTokens
      .map((token, i) => {
        return {
          ...token,
          balance: (balancesDataFlat as bigint[])[i]
        } as TokenWithBalance
      })
      .filter(item => item.balance !== BigInt(0))

    setTokenWithBalance(res)
  }, [balancesData, balancesStatus, blockchainTokensByChunks])

  const refetch = useCallback(() => {
    if (status === 'processing') {
      return
    }

    balancesRefetch()
  }, [status, balancesRefetch])

  useEffect(() => {
    switch (balancesStatus) {
      case 'pending':
        setStatus('processing')
        break
      case 'error':
        setStatus('error')
        break
      case 'success':
        setStatus('success')
        break
      default:
        setStatus('idle')
        break
    }
  }, [balancesStatus])

  return {
    refetch,
    status,
    error: balancesError,
    tokens: tokenWithBalance
  }
}
