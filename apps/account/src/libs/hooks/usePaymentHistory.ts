import { useState, useEffect, useRef, useCallback } from 'react'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import isEqual from 'lodash.isequal'

import useApiRequest from './useApiRequest'
import { PaymentHistoryData, PaymentHistoryDataFilter, PaymentHistoryResponse } from '../../types/payment-history'
import { ApiWrapper } from '../services/api-wrapper'
import { CURRENCY_USD_SYMBOL, PAYMENT_HISTORY_PAGE_SIZE } from '../../constants'
import { useAccountCommonSettings } from '../../states/account-settings/hook'
import { useBlockchains, useTokens } from '../../states/meta/hook'
import { useExchangeRate } from '../../states/exchange-rate/hook'
import { ExchangeRatesResponse } from '../../types/exchange-rate-response'
import { convertPaymentHistoryToPaymentHistoryData } from '../utils'
import { PaymentLogKey } from '../../types/payment-log'
import { ApiRequestStatus } from '../../types/api-request'

export default function usePaymentHistory(filter: PaymentHistoryDataFilter) {
  const [data, setData] = useState<PaymentHistoryData[] | undefined>(undefined)
  const [totalSize, setTotalSize] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const filterRef = useRef<PaymentHistoryDataFilter | undefined>(undefined)
  const lastRef = useRef<PaymentLogKey | undefined>(undefined)

  const commonSettings = useAccountCommonSettings()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()

  const { process: loadPaymentHistory } = useApiRequest<PaymentHistoryResponse>()
  const { process: loadExchangeRates } = useApiRequest<ExchangeRatesResponse>()

  const load = useCallback(async (
    blockchainsToUse: BlockchainMeta[],
    tokensToUse: Token[],
    currencyToUse: string,
    exchangeRateToUse: number,
    filterToUse: PaymentHistoryDataFilter,
    size: number = PAYMENT_HISTORY_PAGE_SIZE
  ) => {
    setStatus('processing')
    setError(undefined)

    try {
      const paymentHistory = await loadPaymentHistory(
        ApiWrapper.instance.accountPaymentHistoryRequest(
          {
            paymentId: filterToUse.paymentId.trim() ? filterToUse.paymentId.trim() : undefined,
            timestampFrom: filterToUse.timestampFrom ? new Date(filterToUse.timestampFrom).getTime() / 1000 : undefined,
            timestampTo: filterToUse.timestampTo ? new Date(filterToUse.timestampTo).getTime() / 1000 : undefined,
            from: filterToUse.from.trim() ? filterToUse.from.trim() : undefined,
            to: filterToUse.to.trim() ? filterToUse.to.trim() : undefined,
            direction: filterToUse.direction ? filterToUse.direction : undefined,
            blockchains: filterToUse.blockchains.length > 0 ? filterToUse.blockchains : undefined,
            transaction: filterToUse.transactionHash.trim() ? filterToUse.transactionHash.trim() : undefined
          },
          lastRef.current,
          size
        )
      )

      const exchangeRates = paymentHistory && paymentHistory.data.length > 0
        ? await loadExchangeRates(
          ApiWrapper.instance.exchangeRatesRequest(currencyToUse, paymentHistory.data.map(item => item.timestamp))
        )
        : undefined

      const newPaymentHistoryData = paymentHistory?.data.map(
        item => convertPaymentHistoryToPaymentHistoryData(
          item,
          blockchainsToUse,
          tokensToUse,
          exchangeRates?.exchangeRates,
          exchangeRateToUse,
          currencyToUse
        )
      )

      setData(prevPaymentHistoryData => [...(prevPaymentHistoryData ?? []), ...(newPaymentHistoryData ?? [])])
      setTotalSize(prevTotalSize => paymentHistory ? paymentHistory.totalSize : prevTotalSize)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setError(error as Error)
    }
  }, [loadPaymentHistory, loadExchangeRates])

  useEffect(() => {
    if (!commonSettings || !blockchains || !tokens || !exchangeRate.current) {
      return
    }

    if (isEqual(filterRef.current, filter)) {
      return
    }

    filterRef.current = filter
    lastRef.current = undefined
    setData(undefined)
    setTotalSize(undefined)

    load(
      blockchains,
      tokens,
      commonSettings.currency ?? CURRENCY_USD_SYMBOL,
      exchangeRate.current.exchangeRate,
      filter
    )
  }, [filter, blockchains, commonSettings, tokens, exchangeRate, load])

  const loadNext = useCallback(async () => {
    if (!commonSettings || !blockchains || !tokens || !exchangeRate.current) {
      return
    }

    const last: PaymentLogKey | undefined = data && data.length > 0
      ? {
        paymentId: data[data.length - 1].paymentId,
        blockchain: data[data.length - 1].blockchainName,
        transaction: data[data.length - 1].transaction,
        index: data[data.length - 1].index,
      }
      : undefined

    if (isEqual(lastRef.current, last)) {
      return
    }

    lastRef.current = last

    await load(
      blockchains,
      tokens,
      commonSettings.currency ?? CURRENCY_USD_SYMBOL,
      exchangeRate.current.exchangeRate,
      filter
    )
  }, [filter, commonSettings, blockchains, tokens, exchangeRate, data, load])

  const reload = useCallback(async () => {
    if (!commonSettings || !blockchains || !tokens || !exchangeRate.current) {
      return
    }

    lastRef.current = undefined
    setData(undefined)
    setTotalSize(undefined)

    const pageNums = data && data.length > 0
      ? Math.floor(data.length / PAYMENT_HISTORY_PAGE_SIZE) + (data.length % PAYMENT_HISTORY_PAGE_SIZE === 0 ? 0 : 1)
      : 1
    const size = pageNums * PAYMENT_HISTORY_PAGE_SIZE

    await load(
      blockchains,
      tokens,
      commonSettings.currency ?? CURRENCY_USD_SYMBOL,
      exchangeRate.current.exchangeRate,
      filter,
      size
    )
  }, [commonSettings, blockchains, tokens, exchangeRate, data, filter, load])

  return { data, totalSize, status, error, loadNext, reload }
}
