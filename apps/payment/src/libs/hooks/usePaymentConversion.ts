import { useCallback, useState } from 'react'
import { Asset, Token } from 'rango-sdk-basic'

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

  const process = useCallback(async (
    from: Token,
    to: Asset | undefined,
    amountCurrency: number,
    slippage: number
  ): Promise<PaymentConversionData | undefined> => {
    const calculateQuote = async (
      appSettingsToUse: AppSettings,
      paymentSettingsToUse: PaymentSettings,
      tokens: Token[],
      fromTokenToUse: Token,
      toAssetToUse: Asset,
      amountUsd: number
    ): Promise<PaymentConversionData | undefined> => {
      const toToken = tokens.find(token => isToken(token, toAssetToUse.blockchain, toAssetToUse.symbol, toAssetToUse.address))
      if (!toToken) {
        return undefined
      }

      const result = await PaymentConversionManager.instance.calculateQuote(
        config.config?.baseUrlApi ?? '',
        appSettingsToUse,
        paymentSettingsToUse,
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
      tokensToUse: Token[],
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
        const result = await calculateQuote(appSettingsToUse, paymentSettingsToUse, tokensToUse, fromTokenToUse, asset, amountUsd)
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
      if (!appSettings || !paymentSettings || !tokens || !exchangeRate) {
        result = undefined
      } else {
        const amountUsd = exchangeRate === 1 ? amountCurrency : amountCurrency / exchangeRate
        result = to
          ? await calculateQuote(appSettings, paymentSettings, tokens, from, to, amountUsd)
          : await calculateQuotes(appSettings, paymentSettings, tokens, from, amountUsd)
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

  }, [config.config?.baseUrlApi, appSettings, exchangeRate, paymentSettings, tokens])

  return { status, data, error, process }
}
