import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { isAssetEqualToToken, tokenAmountToCurrency } from '../../../../libs/utils'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'
import { PaymentDetails } from '../../../../types/payment-details'
import { useExchangeRate } from '../../../../states/settings/hook'
import CurrencyAmount from '../../../CurrencyAmount'
import usePaymentData from '../../../../libs/hooks/usePaymentData'

interface PaymentDetailsInfoProps {
  paymentDetails: PaymentDetails
  restCurrencyAmount: number
  receivedCurrencyAmount: number
}

const PaymentDetailsInfo: React.FC<PaymentDetailsInfoProps> = (props) => {
  const { paymentDetails, restCurrencyAmount, receivedCurrencyAmount } = props

  const { t } = useTranslation()

  const { amount, currency } = usePaymentData()
  const exchangeRate = useExchangeRate()

  return (
    <Card className='mb-2'>
      <Card.Body className='p-2'>
        {!isAssetEqualToToken(paymentDetails.toToken, paymentDetails.fromToken) && (
          <div>
            {t('components.evm_payment.pay_summary_swap')}
            &nbsp;<TokenAmountWithCurrency
              tokenAmount={paymentDetails.fromTokenAmount}
              tokenSymbol={paymentDetails.fromToken.symbol}
              tokenDecimals={paymentDetails.fromToken.decimals}
              currencyAmount={paymentDetails.fromToken.usdPrice && exchangeRate
                ? tokenAmountToCurrency(paymentDetails.fromTokenAmount, paymentDetails.fromToken.usdPrice, paymentDetails.fromToken.decimals, exchangeRate)
                : null
              }
              currency={paymentDetails.currency}
            />
            &nbsp;{t('components.evm_payment.to')}
            &nbsp;<TokenAmountWithCurrency
              tokenAmount={paymentDetails.toTokenSwapAmount}
              tokenSymbol={paymentDetails.toToken.symbol}
              tokenDecimals={paymentDetails.toToken.decimals}
              currencyAmount={paymentDetails.toToken.usdPrice && exchangeRate
                ? tokenAmountToCurrency(paymentDetails.toTokenAmount, paymentDetails.toToken.usdPrice, paymentDetails.toToken.decimals, exchangeRate)
                : null
              }
              currency={paymentDetails.currency}
            />
          </div>
        )}
        <div>
          {t('components.evm_payment.pay_summary_amount')} <CurrencyAmount amount={amount} currency={currency} />
        </div>
        {!!receivedCurrencyAmount && (
          <div>
            {t('components.evm_payment.pay_summary_already_payed_amount')} <CurrencyAmount amount={receivedCurrencyAmount} currency={currency} />
          </div>
        )}
        <div>
          <strong>
            {t('components.evm_payment.pay_summary_total_amount')}
            &nbsp;<TokenAmountWithCurrency
              tokenAmount={paymentDetails.toTokenAmount}
              tokenSymbol={paymentDetails.toToken.symbol}
              tokenDecimals={paymentDetails.toToken.decimals}
              currencyAmount={restCurrencyAmount}
              currency={currency}
            />
          </strong>
        </div>
      </Card.Body>
    </Card>
  )
}

export default PaymentDetailsInfo
