import { useCallback, useState } from 'react'
import { Asset, Token } from 'rango-sdk-basic'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { PaymentConversionData, PaymentConversionResult } from '../../types/payment-conversion-result'
import { useAppSettings, useExchangeRate, usePaymentSettings, useTokens } from '../../states/settings/hook'
import { PaymentConversionManager } from '../services/payment-conversion-manager'
import { AppSettings, PaymentSettings } from '../../types/settings'
import { isAssetEqualToToken, isToken } from '../utils'
import { ApiRequestStatus } from '../../types/api-request'
import { useConfig } from '../../context/config/hook'

export default function usePaymentConversion(): PaymentConversionResult {
  const [data, setData] = useState<PaymentConversionData | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const appSettings = useAppSettings()
  const paymentSettings = usePaymentSettings()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const config = useConfig()
  const { id, paymentId } = useParams()
  const { address: fromAddress } = useAccount()

  const process = useCallback(async (
    from: Token,
    to: Asset | undefined,
    amountCurrency: number,
    slippage: number
  ): Promise<PaymentConversionData | undefined> => {
    const calculateQuote = async (
      appSettingsToUse: AppSettings,
      paymentSettingsToUse: PaymentSettings,
      baseUrlApi: string,
      idToUse: string,
      paymentIdToUse: string,
      tokensToUse: Token[],
      fromAddressToUse: string,
      fromTokenToUse: Token,
      toAssetToUse: Asset,
      amountUsd: number
    ): Promise<PaymentConversionData | undefined> => {
      const fromContract = appSettingsToUse.contracts.find(
        item => item.blockchain.toLocaleLowerCase() === fromTokenToUse.blockchain.toLocaleLowerCase()
      )?.contractAddresses.RangoReceiver
      if (!fromContract) {
        return undefined
      }

      const toContract = appSettingsToUse.contracts.find(
        item => item.blockchain.toLocaleLowerCase() === toAssetToUse.blockchain.toLocaleLowerCase()
      )?.contractAddresses.RangoReceiver
      if (!toContract) {
        return undefined
      }

      const toAddress = paymentSettingsToUse.wallets.find(
        item => item.blockchain.toLocaleLowerCase() === toAssetToUse.blockchain.toLocaleLowerCase()
      )?.address
      if (!toAddress) {
        return undefined
      }

      const toToken = tokensToUse.find(token => isToken(token, toAssetToUse.blockchain, toAssetToUse.symbol, toAssetToUse.address))
      if (!toToken) {
        return undefined
      }

      const result = await PaymentConversionManager.instance.calculateQuote(
        baseUrlApi,
        idToUse,
        paymentIdToUse,
        fromContract,
        toContract,
        fromAddressToUse,
        toAddress,
        fromTokenToUse,
        toToken,
        amountUsd,
        slippage
      )

      return result
    }

    const calculateQuotes = async (
      appSettingsToUse: AppSettings,
      paymentSettingsToUse: PaymentSettings,
      baseUrlApi: string,
      idToUse: string,
      paymentIdToUse: string,
      tokensToUse: Token[],
      fromAddressToUse: string,
      fromTokenToUse: Token,
      amountUsd: number
    ): Promise<PaymentConversionData | undefined> => {
      const assets = [...paymentSettingsToUse.assets]
        .sort((a, b) => {
          const isA = isAssetEqualToToken(a, fromTokenToUse)
          const isB = isAssetEqualToToken(b, fromTokenToUse)
          if (isA && !isB) {
            return -1
          }
          if (!isA && isB) {
            return 1
          }

          const isBlockchainA = fromTokenToUse.blockchain.toLocaleLowerCase() === a.blockchain.toLocaleLowerCase()
          const isBlockchainB = fromTokenToUse.blockchain.toLocaleLowerCase() === b.blockchain.toLocaleLowerCase()
          if (isBlockchainA && !isBlockchainB) {
            return -1
          }
          if (!isBlockchainA && isBlockchainB) {
            return 1
          }

          return 0
        })

      for (const asset of assets) {
        const result = await calculateQuote(
          appSettingsToUse,
          paymentSettingsToUse,
          baseUrlApi,
          idToUse,
          paymentIdToUse,
          tokensToUse,
          fromAddressToUse,
          fromTokenToUse,
          asset,
          amountUsd
        )
        if (result) {
          return result
        }
      }

      return undefined
    }

    setError(undefined)
    setStatus('processing')

    try {
      let result: PaymentConversionData | undefined
      if (!appSettings || !paymentSettings || !tokens || !exchangeRate || !config.config?.baseUrlApi || !fromAddress || !id || !paymentId) {
        result = undefined
      } else {
        const amountUsd = exchangeRate === 1 ? amountCurrency : amountCurrency / exchangeRate
        result = to
          ? await calculateQuote(appSettings, paymentSettings, config.config?.baseUrlApi, id, paymentId,  tokens, fromAddress, from, to, amountUsd)
          : await calculateQuotes(appSettings, paymentSettings, config.config?.baseUrlApi, id, paymentId, tokens, fromAddress, from, amountUsd)
      }

      setData(result)
      setStatus('success')

      return result
    } catch (error) {
      setData(undefined)
      setError(error as Error)
      setStatus('error')

      throw error
    }
  }, [appSettings, paymentSettings, tokens, exchangeRate, config.config?.baseUrlApi, fromAddress, id, paymentId])

  return { status, data, error, process }
}
