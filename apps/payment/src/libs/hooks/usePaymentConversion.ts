import { useCallback, useState } from 'react'
import { Asset, Token } from 'rango-sdk-basic'

import { PaymentConversionData, PaymentConversionResult } from '../../types/payment-conversion-result'
import { useExchangeRate, usePaymentSettings, useTokens } from '../../states/settings/hook'
import { PaymentConversionManager } from '../services/payment-conversion-manager'
import { PaymentSettings } from '../../types/settings'
import { isToken } from '../utils'
import { ApiRequestStatus } from '../../types/api-request'
import { useConfig } from '../../context/config/hook'

export default function usePaymentConversion(): PaymentConversionResult {
  const [data, setData] = useState<PaymentConversionData | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

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
      baseUrlApi: string,
      tokensToUse: Token[],
      fromTokenToUse: Token,
      toAssetToUse: Asset,
      amountUsd: number
    ): Promise<PaymentConversionData | undefined> => {
      const toToken = tokensToUse.find(token => isToken(token, toAssetToUse.blockchain, toAssetToUse.symbol, toAssetToUse.address))
      if (!toToken) {
        return undefined
      }

      const result = await PaymentConversionManager.instance.calculateQuote(
        baseUrlApi,
        fromTokenToUse,
        toToken,
        amountUsd,
        slippage
      )

      return result
    }

    const calculateQuotes = async (
      paymentSettingsToUse: PaymentSettings,
      baseUrlApi: string,
      tokensToUse: Token[],
      fromTokenToUse: Token,
      amountUsd: number
    ): Promise<PaymentConversionData | undefined> => {
      const assets = [...paymentSettingsToUse.assets]
        .filter(item => item.blockchain.toLocaleLowerCase() === fromTokenToUse.blockchain.toLocaleLowerCase())

      for (const asset of assets) {
        const result = await calculateQuote(
          baseUrlApi,
          tokensToUse,
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
      if (!paymentSettings || !tokens || !exchangeRate || !config.config?.baseUrlApi) {
        result = undefined
      } else {
        const amountUsd = exchangeRate === 1 ? amountCurrency : amountCurrency / exchangeRate
        result = to
          ? await calculateQuote(config.config?.baseUrlApi, tokens, from, to, amountUsd)
          : await calculateQuotes(paymentSettings, config.config?.baseUrlApi, tokens, from, amountUsd)
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
  }, [config.config?.baseUrlApi, exchangeRate, paymentSettings, tokens])

  return { status, data, error, process }
}
