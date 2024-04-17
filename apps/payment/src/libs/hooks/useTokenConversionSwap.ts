import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SwapResponse } from 'rango-sdk-basic'

import { createImMessage, sameToken, tokenAmountToCurrency } from '../utils'
import useApiRequest from './useApiRequest'
import { PaymentDetails } from '../../types/payment-details'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequestStatus } from '../../types/api-request'
import { useExchangeRate, useTokens } from '../../states/settings/hook'

export default function useTokenConversionSwap(
  paymentDetails: PaymentDetails,
  onError?: (error: Error | undefined) => void,
  onSuccess?: (data: SwapResponse | undefined) => void
) {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<SwapResponse | undefined>(undefined)
  const [txId, setTxId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()

  const { process: loadSwap } = useApiRequest<SwapResponse>()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()

  const handle = useCallback(async () => {
    setTxId(undefined)
    setData(undefined)
    setError(undefined)
    setStatus('idle')

    if (!exchangeRate || !tokens) {
      return
    }

    setStatus('processing')

    loadSwap(
      ApiWrapper.instance.swapRequest(
        paymentDetails.fromAddress,
        paymentDetails.toAddress,
        paymentDetails.fromContracts.RangoReceiver,
        paymentDetails.toContracts.RangoReceiver,
        createImMessage(paymentDetails.fromAddress, paymentDetails.toAddress, paymentDetails.protocolPaymentId),
        paymentDetails.fromToken,
        paymentDetails.toAsset,
        paymentDetails.tokenAmount,
        paymentDetails.slippage
      )
    )
      .then((response): void => {
        if (!response) {
          const error = new Error(t('hooks.token_conversion_swap.errors.swap_not_defined'))

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          onError?.(error)

          return
        }

        if (response.error) {
          const error = new Error(response.error)

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          onError?.(error)

          return
        }

        if (!response.tx) {
          const error = new Error(t('hooks.token_conversion_swap.errors.swap_transaction_not_defined'))

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          onError?.(error)

          return
        }

        const toToken = tokens.find(token => response.route && sameToken(token, response.route.to))
        const amountCurrency = response.route && toToken?.usdPrice
          ? tokenAmountToCurrency(response.route.outputAmountMin, toToken.usdPrice, toToken.decimals, exchangeRate)
          : undefined
        if (!amountCurrency || amountCurrency < paymentDetails.amountCurrencyRequired) {
          const error = new Error(t('hooks.token_conversion_swap.errors.token_output_amount_less_than_required', {
            currency: paymentDetails.currency.toLocaleUpperCase(),
            amountCurrency: amountCurrency ?? 'undefined',
            amountCurrencyRequired: paymentDetails.amountCurrencyRequired
          }))

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          onError?.(error)

          return
        }

        setTxId(response.requestId)
        setData(response)
        setError(undefined)
        setStatus('success')

        onSuccess?.(response)
      })
      .catch(error => {
        setTxId(undefined)
        setData(undefined)
        setError(error as Error)
        setStatus('error')

        onError?.(error)
      })
  }, [
    t,
    paymentDetails.amountCurrencyRequired,
    paymentDetails.currency,
    paymentDetails.fromAddress,
    paymentDetails.fromContracts.RangoReceiver,
    paymentDetails.fromToken,
    paymentDetails.protocolPaymentId,
    paymentDetails.slippage,
    paymentDetails.toAddress,
    paymentDetails.toAsset,
    paymentDetails.toContracts.RangoReceiver,
    paymentDetails.tokenAmount,
    exchangeRate,
    tokens,
    loadSwap,
    onError,
    onSuccess
  ])

  return {
    status,
    error,
    data,
    txId,
    handle
  }
}
