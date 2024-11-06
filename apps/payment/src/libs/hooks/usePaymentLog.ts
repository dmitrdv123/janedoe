import { useCallback } from 'react'

import useApiRequest from './useApiRequest'
import { ApiWrapper } from '../services/api-wrapper'
import { ExchangeRatesResponse } from '../../types/exchange-rate-response'
import { convertPaymentLogToPaymentLogData } from '../utils'
import { useExchangeRate } from '../../states/settings/hook'
import { PaymentLogResponse } from '../../types/payment-log'
import usePaymentData from './usePaymentData'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

export default function usePaymentLogs() {
  const exchangeRate = useExchangeRate()
  const { id, paymentId, currency } = usePaymentData()

  const { process: loadPaymentLogs } = useApiRequest<PaymentLogResponse>()
  const { process: loadExchangeRates } = useApiRequest<ExchangeRatesResponse>()

  return useCallback(async (blockchains: BlockchainMeta[], tokens: Token[]) => {
    const paymentLogs = await loadPaymentLogs(
      ApiWrapper.instance.paymentLogsRequest(id, paymentId)
    )

    const exchangeRates = paymentLogs && paymentLogs.data.length > 0
      ? await loadExchangeRates(
        ApiWrapper.instance.exchangeRatesRequest(currency, paymentLogs.data.map(item => item.timestamp))
      )
      : undefined

    const data = paymentLogs?.data.map(
      item => convertPaymentLogToPaymentLogData(
        item,
        blockchains,
        tokens,
        exchangeRates?.exchangeRates,
        exchangeRate,
        currency
      )
    )

    return data
  }, [currency, exchangeRate, id, paymentId, loadExchangeRates, loadPaymentLogs])
}
