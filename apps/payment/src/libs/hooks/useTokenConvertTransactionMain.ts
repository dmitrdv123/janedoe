import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EvmTransaction, TransactionStatus } from 'rango-sdk-basic'
import { useWalletClient } from 'wagmi'

import { ApiRequestStatus } from '../../types/api-request'
import { ApiManager } from '../services/api-manager'
import { useConfig } from '../../context/config/hook'
import useDoUntil from './useDoUntil'
import { getAddressOrDefault, tryParseInt } from '../utils'
import { CHAINS } from '../../constants'
import { PaymentConversionError } from '../../types/errors/payment-conversion-error'

export default function useTokenConvertTransactionMain() {
  const statusRef = useRef<ApiRequestStatus>('idle')

  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [txId, setTxId] = useState<string | undefined>(undefined)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)

  const config = useConfig()
  const { t } = useTranslation()
  const { data: signer } = useWalletClient()
  const doUntilHandler = useDoUntil()

  useEffect(() => {
    if (status === 'processing' && txId && requestId && config.config) {
      const baseUrlApi = config.config.baseUrlApi

      const clearInterval = doUntilHandler(1000, async () => {
        try {
          const result = await ApiManager.instance.checkTransactionStatus(baseUrlApi, requestId, txId)

          switch (result.status) {
            case TransactionStatus.SUCCESS:
              setData(undefined)
              setError(undefined)
              setStatus('success')
              statusRef.current = 'success'
              return true
            case TransactionStatus.FAILED:
              setData(t('hooks.token_conversion_main.transaction_waiting_error', { requestId, txId }))
              setError(new PaymentConversionError('Token conversion transaction failed', result, requestId, txId))
              setStatus('error')
              statusRef.current = 'error'
              return true
            default:
              setData(t('hooks.token_conversion_main.transaction_waiting', { requestId, txId }))
              setError(undefined)
              setStatus('processing')
              return false
          }
        } catch (err) {
          setData(t('hooks.token_conversion_main.transaction_waiting_error', { requestId, txId }))
          setError(err as Error)
          setStatus('error')
          return false
        }
      })

      return clearInterval
    }
  }, [config.config, requestId, status, t, txId, doUntilHandler])

  const handle = useCallback(async (requestIdToUse: string | undefined, evmTx: EvmTransaction | undefined) => {
    if (statusRef.current === 'processing') {
      return
    }

    setTxId(undefined)
    setData(undefined)
    setError(undefined)

    if (!signer || !requestIdToUse || !evmTx) {
      setStatus('idle')
      statusRef.current = 'idle'

      return
    }

    try {
      setData(t('hooks.token_conversion_main.transaction_confirming', { requestId: requestIdToUse }))
      setRequestId(requestIdToUse)
      setStatus('processing')
      statusRef.current = 'processing'

      const evmTxChainId = tryParseInt(evmTx.blockChain.chainId)
      const chain = CHAINS.find(chain => chain.id === evmTxChainId)
      const account = evmTx?.from ? getAddressOrDefault(evmTx?.from) : undefined
      const to = evmTx?.txTo ? getAddressOrDefault(evmTx?.txTo) : undefined
      const txData = evmTx?.txData ? evmTx.txData as `0x${string}` : undefined
      const txValue = evmTx?.value ? BigInt(evmTx.value) : undefined

      const gasPriceStr = evmTx?.gasPrice && !evmTx?.gasPrice.startsWith('0x')
        ? '0x' + parseInt(evmTx?.gasPrice).toString(evmTx?.blockChain.defaultDecimals) : null
      const maxFeePerGasStr = evmTx?.maxFeePerGas
      const maxPriorityFeePerGasStr = evmTx?.maxPriorityFeePerGas

      const gasPrice = gasPriceStr ? BigInt(gasPriceStr) : undefined
      let maxFeePerGas: bigint | undefined = undefined
      let maxPriorityFeePerGas: bigint | undefined = undefined

      if (!gasPrice && maxFeePerGasStr && maxPriorityFeePerGasStr) {
        maxFeePerGas = BigInt(maxFeePerGasStr)
        maxPriorityFeePerGas = BigInt(maxPriorityFeePerGasStr)
      }

      const response = await signer.sendTransaction(gasPrice
        ? {
          chain,
          gasPrice,
          account,
          to,
          data: txData,
          value: txValue
        }
        : {
          chain,
          maxFeePerGas,
          maxPriorityFeePerGas,
          account,
          to,
          data: txData,
          value: txValue
        }
      )

      setTxId(response)
      setData(t('hooks.token_conversion_main.transaction_confirmed', { requestId: requestIdToUse, txId: response }))
    } catch (err) {
      const error = err as Error

      setTxId(undefined)
      setError(error)
      setStatus('error')

      statusRef.current = 'error'
    }
  }, [signer, t])

  return {
    status,
    data,
    txId,
    error,
    handle
  }
}