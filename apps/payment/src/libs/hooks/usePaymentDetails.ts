import { Asset, BlockchainMeta, Token } from 'rango-sdk-basic'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { PaymentDetails } from '../../types/payment-details'
import { useAppSettings, usePaymentSettings } from '../../states/settings/hook'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_PROCESSING_ERROR } from '../../constants'
import { useParams } from 'react-router-dom'

export default function usePaymentDetails(
  fromBlockchain: BlockchainMeta,
  fromToken: Token | undefined,
  toAsset: Asset | undefined,
  tokenAmount: string | undefined,
  slippage: number | undefined,
  amount: number,
  currency: string
): PaymentDetails | undefined {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>(undefined)

  const { t } = useTranslation()
  const { address: fromAddress } = useAccount()
  const { id, paymentId } = useParams()

  const appSettings = useAppSettings()
  const paymentSettings = usePaymentSettings()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (
      !appSettings
      || !paymentSettings
      || !id
      || !paymentId
      || !fromToken?.usdPrice
      || !fromAddress
      || !toAsset
      || !tokenAmount
    ) {
      setPaymentDetails(undefined)
      return
    }

    const protocolPaymentId = id + paymentId

    const toAddress = paymentSettings.wallets.find(
      item => item.blockchain.toLocaleLowerCase() === toAsset.blockchain.toLocaleLowerCase()
    )?.address
    if (!toAddress) {
      setPaymentDetails(undefined)
      addInfoMessage(t('hooks.payment_details.errors.wallet_not_found', {
        blockchain: toAsset.blockchain
      }), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger')

      return
    }

    const fromContracts = appSettings.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === fromToken.blockchain.toLocaleLowerCase()
    )?.contractAddresses
    if (!fromContracts) {
      setPaymentDetails(undefined)
      addInfoMessage(t('hooks.payment_details.errors.contract_not_found', {
        blockchain: fromToken.blockchain
      }), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger')

      return
    }

    const toContracts = appSettings.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === toAsset.blockchain.toLocaleLowerCase()
    )?.contractAddresses
    if (!toContracts) {
      setPaymentDetails(undefined)
      addInfoMessage(t('hooks.payment_details.errors.contract_not_found', {
        blockchain: toAsset.blockchain
      }), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger')

      return
    }

    removeInfoMessage(INFO_MESSAGE_PAYMENT_PROCESSING_ERROR)
    setPaymentDetails({
      fromBlockchain,
      protocolPaymentId,
      fromToken,
      toAsset,
      fromAddress,
      toAddress,
      fromContracts,
      toContracts,
      slippage,
      currency,
      amountCurrencyRequired: amount,
      tokenAmount: tokenAmount
    })
  }, [
    id,
    paymentId,
    fromBlockchain,
    fromToken,
    toAsset,
    fromAddress,
    tokenAmount,
    slippage,
    appSettings,
    paymentSettings,
    amount,
    currency,
    t,
    addInfoMessage,
    removeInfoMessage
  ])

  return paymentDetails
}
