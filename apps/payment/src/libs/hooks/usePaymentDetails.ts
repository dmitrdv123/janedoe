import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Address } from 'viem'

import { PaymentDetails } from '../../types/payment-details'
import { useAppSettings } from '../../states/settings/hook'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_DETAILS_ERROR } from '../../constants'

export default function usePaymentDetails(
  id: string,
  paymentId : string,
  fromAddress: Address | undefined,
  toAddress: Address | undefined,
  fromBlockchain: BlockchainMeta,
  fromToken: Token | undefined,
  toBlockchain: BlockchainMeta,
  toToken: Token | undefined,
  fromTokenAmount: string | undefined,
  toTokenAmount: string | undefined,
  toTokenSwapAmount: string | undefined,
  slippage: number | undefined,
  currencyAmount: number,
  currency: string
): PaymentDetails | undefined {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>(undefined)

  const { t } = useTranslation()

  const appSettings = useAppSettings()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (
      !appSettings
      || !fromAddress
      || !toAddress
      || !fromToken
      || !toToken
      || !fromTokenAmount
      || !toTokenAmount
      || !toTokenSwapAmount
    ) {
      setPaymentDetails(undefined)
      return
    }

    const protocolPaymentId = id + paymentId

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
      protocolPaymentId,
      fromBlockchain,
      fromToken,
      toBlockchain,
      toToken,
      fromAddress,
      toAddress,
      fromContracts,
      toContracts,
      fromTokenAmount,
      toTokenAmount,
      toTokenSwapAmount,
      currencyAmount,
      currency,
      slippage,
    })
  }, [
    id,
    paymentId,
    fromBlockchain,
    fromToken,
    toBlockchain,
    toToken,
    fromAddress,
    toAddress,
    fromTokenAmount,
    toTokenAmount,
    toTokenSwapAmount,
    currencyAmount,
    currency,
    slippage,
    appSettings,
    t,
    addInfoMessage,
    removeInfoMessage
  ])

  return paymentDetails
}
