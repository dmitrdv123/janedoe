import { QuoteResponse, RoutingResultType, Token } from 'rango-sdk-basic'

import { ApiWrapper } from './api-wrapper'
import { isNullOrEmptyOrWhitespaces, tokenAmountToUsd, usdToTokenAmount } from '../utils'
import { ALLOWED_DELTA, DELTA_COEF, MAX_QUOTE_ITERATIONS } from '../../constants'
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
    fromToken: Token,
    toToken: Token,
    amountUsd: number,
    slippage: number
  ): Promise<PaymentConversionData | undefined> {
    if (!fromToken.usdPrice) {
      return undefined
    }

    if (!toToken.usdPrice) {
      return undefined
    }

    let totalAmountUsd = amountUsd
    let i = 0

    do {
      const tokenAmount = usdToTokenAmount(totalAmountUsd, fromToken.usdPrice, fromToken.decimals)
      const request = ApiWrapper.instance.quoteRequest({
        from: fromToken,
        to: toToken,
        amount: tokenAmount,
        contractCall: false,
        enableCentralizedSwappers: true,
        swappers: totalAmountUsd <= 1 ? ['MayaProtocol'] : undefined,
        swappersExclude: totalAmountUsd <= 1 ? true : undefined
      }, slippage)
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

      const outputAmountUsd = tokenAmountToUsd(outputAmount, toToken.usdPrice, toToken.decimals)
      const amountDeltaUsd = amountUsd - outputAmountUsd
      if (outputAmountUsd >= amountUsd && Math.abs(amountDeltaUsd) / amountUsd <= ALLOWED_DELTA) {
        return {
          amount: tokenAmount,
          quote: quote.route
        }
      }

      totalAmountUsd += DELTA_COEF * amountDeltaUsd
      if (totalAmountUsd <= 0) {
        return undefined
      }

      ++i
    } while (i < MAX_QUOTE_ITERATIONS)

    return undefined
  }
}