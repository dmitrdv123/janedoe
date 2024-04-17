import { BlockchainMeta, WalletDetailsResponse } from 'rango-sdk-basic'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_WALLET_DETAILS_ERROR } from '../../constants'
import { ApiWrapper } from '../services/api-wrapper'
import useApiRequest from './useApiRequest'

export default function useWalletDetails(blockchain: BlockchainMeta | undefined, address: string | undefined) {
  const { t } = useTranslation()

  const { data: walletDetailsResponse, status, process: loadWalletDetails } = useApiRequest<WalletDetailsResponse>()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    const fetch = async (walletBlockchain: BlockchainMeta, walletAddress: string) => {
      removeInfoMessage(INFO_MESSAGE_WALLET_DETAILS_ERROR)
      try {
        await loadWalletDetails(ApiWrapper.instance.walletDetailsRequest(walletBlockchain, walletAddress))
      } catch (error) {
        addInfoMessage(
          t('hooks.wallet_details.errors.load_error', { blockchain: walletBlockchain.name }),
          INFO_MESSAGE_WALLET_DETAILS_ERROR,
          'warning',
          error
        )
      }
    }

    if (blockchain && address) {
      fetch(blockchain, address)
    }
  }, [blockchain, address, t, loadWalletDetails, addInfoMessage, removeInfoMessage])

  return {
    status,
    data: walletDetailsResponse && walletDetailsResponse.wallets.length > 0 ? walletDetailsResponse.wallets[0]: undefined
  }
}
