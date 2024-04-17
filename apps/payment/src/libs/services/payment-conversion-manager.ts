import { QuoteResponse, RoutingResultType, Token } from 'rango-sdk-basic'

import { AppSettings, PaymentSettings } from '../../types/settings'
import { ApiWrapper } from './api-wrapper'
import { isNullOrEmptyOrWhitespaces, tokenAmountToUsd, usdToTokenAmount } from '../utils'
import { ALLOWED_DELTA, MAX_QUOTE_ITERATIONS } from '../../constants'
import { PaymentConversionData } from '../../types/payment-conversion-result'

export class PaymentConversionManager {
  private static _instance: PaymentConversionManager

  private constructor() { }

  public static get instance(): PaymentConversionManager {
    if (!PaymentConversionManager._instance) {
      PaymentConversionManager._instance = new PaymentConversionManager()
    }

    return PaymentConversionManager._instance
  }

  public async calculateQuote(
    baseUrlApi: string,
    appSettings: AppSettings,
    paymentSettings: PaymentSettings,
    from: Token,
    to: Token,
    amountUsd: number,
    slippage: number
  ): Promise<PaymentConversionData | undefined> {
    const toWallet = paymentSettings.wallets.find(item => item.blockchain.toLocaleLowerCase() === to.blockchain.toLocaleLowerCase())
    if (!toWallet) {
      return undefined
    }

    const fromRangoReceiverContract = appSettings.contracts.find(item => item.blockchain.toLocaleLowerCase() === from.blockchain.toLocaleLowerCase())?.contractAddresses.RangoReceiver
    if (!fromRangoReceiverContract) {
      return undefined

    }

    const toRangoReceiverContract = appSettings.contracts.find(item => item.blockchain.toLocaleLowerCase() === to.blockchain.toLocaleLowerCase())?.contractAddresses.RangoReceiver
    if (toRangoReceiverContract === undefined) {
      return undefined
    }

    if (!from.usdPrice) {
      return undefined
    }

    if (!to.usdPrice) {
      return undefined
    }

    let totalAmountUsd = amountUsd
    let i = 0

    do {
      const tokenAmount = usdToTokenAmount(totalAmountUsd, from.usdPrice, from.decimals)
      const request = ApiWrapper.instance.quoteRequest(fromRangoReceiverContract, toRangoReceiverContract, from, to, tokenAmount, slippage)
      const quote = await ApiWrapper.instance.send<QuoteResponse>({
        ...request,
        url: request.url.replace('{baseUrlApi}', baseUrlApi)
      })

      if (
        quote.resultType !== RoutingResultType.OK
        || !quote.route
        || !isNullOrEmptyOrWhitespaces(quote.error)
        || quote.route.fee.findIndex(fee => fee.expenseType !== 'DECREASE_FROM_OUTPUT' && fee.expenseType !== 'FROM_SOURCE_WALLET') !== -1
      ) {
        return undefined
      }

      const outputAmount = quote.route.outputAmountMin
      if (!outputAmount || BigInt(outputAmount) <= 0) {
        return undefined
      }

      const outputAmountUsd = tokenAmountToUsd(outputAmount, to.usdPrice, to.decimals)
      const amountDeltaUsd = amountUsd - outputAmountUsd
      if (outputAmountUsd >= amountUsd && Math.abs(amountDeltaUsd) / amountUsd < ALLOWED_DELTA) {
        return {
          amount: tokenAmount,
          quote: quote.route
        }
      }

      totalAmountUsd += amountDeltaUsd
      if (totalAmountUsd <= 0) {
        return undefined
      }

      ++i
    } while (i < MAX_QUOTE_ITERATIONS)

    return undefined
  }
}