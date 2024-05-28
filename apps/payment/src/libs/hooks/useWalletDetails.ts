import { BlockchainMeta, WalletDetailsResponse } from 'rango-sdk-basic'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_WALLET_DETAILS_ERROR } from '../../constants'
import { ApiWrapper } from '../services/api-wrapper'
import useApiRequest from './useApiRequest'

export default function useWalletDetails(blockchain: BlockchainMeta | undefined, address: string | undefined) {
  const { t } = useTranslation()

  const { data: walletDetailsResponse, status, process: loadWalletDetails } = useApiRequest<WalletDetailsResponse>()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const handle = useCallback(async () => {
    if (!blockchain || !address) {
      return
    }

    removeInfoMessage(INFO_MESSAGE_WALLET_DETAILS_ERROR)
    try {
      await loadWalletDetails(ApiWrapper.instance.walletDetailsRequest(blockchain, address))
    } catch (error) {
      addInfoMessage(
        t('hooks.wallet_details.errors.load_error', { blockchain: blockchain.name }),
        INFO_MESSAGE_WALLET_DETAILS_ERROR,
        'warning',
        error
      )
    }
  }, [address, blockchain, t, loadWalletDetails, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    handle()
  }, [handle])

  return {
    status,
    handle,
    data: walletDetailsResponse && walletDetailsResponse.wallets.length > 0 ? walletDetailsResponse.wallets[0]: undefined
  }
}
