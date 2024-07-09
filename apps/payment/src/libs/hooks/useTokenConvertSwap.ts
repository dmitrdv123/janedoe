import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SwapResponse } from 'rango-sdk-basic'

import { currencyToUsd, sameToken, tokenAmountToCurrency } from '../utils'
import useApiRequest from './useApiRequest'
import { PaymentDetails } from '../../types/payment-details'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequestStatus } from '../../types/api-request'
import { useExchangeRate, useTokens } from '../../states/settings/hook'

export default function useTokenConvertSwap() {
  const statusRef = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<SwapResponse | undefined>(undefined)
  const [txId, setTxId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const { t } = useTranslation()

  const { process: loadSwap } = useApiRequest<SwapResponse>()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()

  const handle = useCallback((paymentDetails: PaymentDetails) => {
    if (statusRef.current === 'processing' || !exchangeRate || !tokens) {
      return
    }
    statusRef.current = 'processing'

    setTxId(undefined)
    setData(undefined)
    setError(undefined)
    setStatus('processing')

    const amountUsd = currencyToUsd(paymentDetails.currencyAmount, exchangeRate)

    loadSwap(
      ApiWrapper.instance.swapRequest({
        fromAddress: paymentDetails.fromAddress,
        toAddress: paymentDetails.toAddress,
        from: paymentDetails.fromToken,
        to: paymentDetails.toToken,
        amount: paymentDetails.fromTokenAmount,
        slippage: paymentDetails.slippage ? paymentDetails.slippage.toString() : '',
        contractCall: false,
        disableEstimate: false,
        enableCentralizedSwappers: true,
        swappers: amountUsd <= 1 ? ['MayaProtocol'] : undefined,
        swappersExclude: amountUsd <= 1 ? true : undefined
      })
    )
      .then((response): void => {
        if (!response) {
          const error = new Error(t('hooks.token_conversion_swap.errors.swap_not_defined'))

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          statusRef.current = 'error'

          return
        }

        if (response.error) {
          const error = new Error(response.error)

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          statusRef.current = 'error'

          return
        }

        if (!response.tx) {
          const error = new Error(t('hooks.token_conversion_swap.errors.swap_transaction_not_defined'))

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          statusRef.current = 'error'

          return
        }

        const toToken = tokens.find(token => response.route && sameToken(token, response.route.to))
        const amountCurrency = response.route && toToken?.usdPrice
          ? tokenAmountToCurrency(response.route.outputAmountMin, toToken.usdPrice, toToken.decimals, exchangeRate)
          : undefined
        if (!amountCurrency || amountCurrency < paymentDetails.currencyAmount) {
          const error = new Error(t('hooks.token_conversion_swap.errors.token_output_amount_less_than_required', {
            currency: paymentDetails.currency.toLocaleUpperCase(),
            amountCurrency: amountCurrency ?? 'undefined',
            currencyAmount: paymentDetails.currencyAmount
          }))

          setTxId(undefined)
          setData(undefined)
          setError(error)
          setStatus('error')

          statusRef.current = 'error'

          return
        }

        setTxId(response.requestId)
        setData(response)
        setError(undefined)
        setStatus('success')

        statusRef.current = 'success'
      })
      .catch(error => {
        setTxId(undefined)
        setData(undefined)
        setError(error as Error)
        setStatus('error')

        statusRef.current = 'error'
      })
  }, [
    t,
    exchangeRate,
    tokens,
    loadSwap
  ])

  return {
    status,
    error,
    data,
    txId,
    handle
  }
}
