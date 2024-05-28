import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { PaymentDetails } from '../../types/payment-details'
import { useAppSettings, usePaymentSettings } from '../../states/settings/hook'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_DETAILS_ERROR } from '../../constants'
import { useParams } from 'react-router-dom'

export default function usePaymentDetails(
  fromBlockchain: BlockchainMeta,
  fromToken: Token | undefined,
  toBlockchain: BlockchainMeta,
  toToken: Token | undefined,
  fromTokenAmount: string | undefined,
  toTokenAmount: string | undefined,
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
      || !toToken?.usdPrice
      || !fromTokenAmount
      || !toTokenAmount
    ) {
      setPaymentDetails(undefined)
      return
    }

    const protocolPaymentId = id + paymentId
    const toAddress = fromAddress

    const fromContracts = appSettings.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === fromToken.blockchain.toLocaleLowerCase()
    )?.contractAddresses
    if (!fromContracts) {
      setPaymentDetails(undefined)
      addInfoMessage(t('hooks.payment_details.errors.contract_not_found', {
        blockchain: fromToken.blockchain
      }), INFO_MESSAGE_PAYMENT_DETAILS_ERROR, 'danger')

      return
    }

    const toContracts = appSettings.contracts.find(
      item => item.blockchain.toLocaleLowerCase() === toToken.blockchain.toLocaleLowerCase()
    )?.contractAddresses
    if (!toContracts) {
      setPaymentDetails(undefined)
      addInfoMessage(t('hooks.payment_details.errors.contract_not_found', {
        blockchain: toToken.blockchain
      }), INFO_MESSAGE_PAYMENT_DETAILS_ERROR, 'danger')

      return
    }

    removeInfoMessage(INFO_MESSAGE_PAYMENT_DETAILS_ERROR)
    setPaymentDetails({
      fromBlockchain,
      protocolPaymentId,
      fromToken,
      toBlockchain,
      toToken,
      fromAddress,
      toAddress,
      fromContracts,
      toContracts,
      slippage,
      currency,
      fromTokenAmount,
      toTokenAmount,
      currencyAmount: amount,
    })
  }, [
    id,
    paymentId,
    fromBlockchain,
    fromToken,
    toBlockchain,
    toToken,
    fromAddress,
    fromTokenAmount,
    toTokenAmount,
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
