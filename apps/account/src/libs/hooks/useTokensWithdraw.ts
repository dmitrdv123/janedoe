import { useCallback, useMemo } from 'react'
import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'
import { useAccount } from 'wagmi'

import { ContractCallResult } from '../../types/contract-call-result'
import { getAddressOrDefault, getTronAddressOrDefault, isBlockchainNativeToken } from '../utils'
import { useSettings } from '../../states/settings/hook'
import { TokenWithBalance } from '../../types/token-with-balance'
import useJanedoeContractWrite from './useJanedoeContractWrite'

export default function useTokensWithdraw(
  blockchain: BlockchainMeta,
  tokens: TokenWithBalance[] | undefined,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (hash: string | undefined) => void,
  onProcessing?: () => void
): ContractCallResult {
  const appSettings = useSettings()
  const { address } = useAccount()

  const args = useMemo(() => {
    if (!address) {
      return undefined
    }
    const contracts = appSettings.current?.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
    )
    const wrappedNativeAddress = contracts?.contractAddresses.WrappedNative
    if (!wrappedNativeAddress) {
      return undefined
    }

    return tokens
      ?.map(token => {
        const tokenAddress = isBlockchainNativeToken(blockchain, token)
          ? getAddressOrDefault(wrappedNativeAddress)
          : (blockchain.type === TransactionType.TRON ? getTronAddressOrDefault(token.address) : getAddressOrDefault(token.address))

        if (!tokenAddress) {
          return undefined
        }

        return {
          accountAddress: address,
          tokenAddress: tokenAddress,
          amount: token.balance,
        }
      })
      .reduce((acc, cur) => {
        if (!!cur && cur.amount > 0) {
          acc[0] = [...acc[0], cur.accountAddress]
          acc[1] = [...acc[1], cur.tokenAddress]
          acc[2] = [...acc[2], cur.amount]
        }

        return acc
      }, [[], [], []] as [`0x${string}`[], `0x${string}`[], bigint[]])
  }, [address, appSettings, blockchain, tokens])

  const {
    status,
    data,
    txId,
    error,
    handle
  } = useJanedoeContractWrite(blockchain, 'withdrawToBatch', args, undefined, onError, onSuccess, onProcessing)

  const handleCallback = useCallback(() => {
    if (!args) {
      return
    }

    handle()
  }, [args, handle])

  return {
    status,
    data,
    txId,
    error,
    handle: handleCallback
  }
}
