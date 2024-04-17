import { useCallback } from 'react'

import useApiRequest from './useApiRequest'
import { ApiWrapper } from '../services/api-wrapper'
import { ExchangeRatesResponse } from '../../types/exchange-rate-response'
import { convertPaymentHistoryToPaymentHistoryData } from '../utils'
import { useExchangeRate } from '../../states/settings/hook'
import { PaymentHistoryResponse } from '../../types/payment-history'
import usePaymentData from './usePaymentData'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

export default function usePaymentHistory() {
  const exchangeRate = useExchangeRate()
  const { id, paymentId, currency } = usePaymentData()

  const { process: loadPaymentHistory } = useApiRequest<PaymentHistoryResponse>()
  const { process: loadExchangeRates } = useApiRequest<ExchangeRatesResponse>()

  return useCallback(async (blockchains: BlockchainMeta[], tokens: Token[]) => {
    const paymentHistory = await loadPaymentHistory(
      ApiWrapper.instance.paymentHistoryRequest(id, paymentId)
    )

    const exchangeRates = paymentHistory && paymentHistory.data.length > 0
      ? await loadExchangeRates(
        ApiWrapper.instance.exchangeRatesRequest(currency, paymentHistory.data.map(item => item.timestamp))
      )
      : undefined

    const data = paymentHistory?.data.map(
      item => convertPaymentHistoryToPaymentHistoryData(
        item,
        blockchains,
        tokens,
        exchangeRates?.exchangeRates,
        exchangeRate,
        currency
      )
    )

    return data
  }, [currency, exchangeRate, id, paymentId, loadExchangeRates, loadPaymentHistory])
}
