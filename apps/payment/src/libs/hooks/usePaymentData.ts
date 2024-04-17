import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { isNullOrEmptyOrWhitespaces, tryParseFloat } from '../utils'
import { CURRENCY_USD_SYMBOL, INFO_MESSAGE_AMOUNT_CURRENCY_ERROR, INFO_MESSAGE_CURRENCY_ERROR, INFO_MESSAGE_ID_ERROR, INFO_MESSAGE_PAYMENT_ID_ERROR } from '../../constants'
import { PaymentData } from '../../types/payment-data'
import { useInfoMessages } from '../../states/application/hook'

export default function usePaymentData(): PaymentData {
  const { id, paymentId, currency, amount } = useParams()
  const { t } = useTranslation()

  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (isNullOrEmptyOrWhitespaces(id)) {
      addInfoMessage(t('hooks.payment_data.errors.id_not_set'), INFO_MESSAGE_ID_ERROR, 'danger')
    } else {
      removeInfoMessage(INFO_MESSAGE_ID_ERROR)
    }
  }, [id, t, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (isNullOrEmptyOrWhitespaces(paymentId)) {
      addInfoMessage(t('hooks.payment_data.errors.payment_id_not_set'), INFO_MESSAGE_PAYMENT_ID_ERROR, 'danger')
    } else {
      removeInfoMessage(INFO_MESSAGE_PAYMENT_ID_ERROR)
    }
  }, [paymentId, t, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (isNullOrEmptyOrWhitespaces(currency)) {
      addInfoMessage(t('hooks.payment_data.errors.currency_not_set'), INFO_MESSAGE_CURRENCY_ERROR, 'danger')
    } else {
      removeInfoMessage(INFO_MESSAGE_CURRENCY_ERROR)
    }
  }, [currency, t, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    const amountCurrency = tryParseFloat(amount)
    if (amountCurrency === undefined || amountCurrency <= 0) {
      addInfoMessage(t('hooks.payment_data.errors.amount_currency_error'), INFO_MESSAGE_AMOUNT_CURRENCY_ERROR, 'danger')
    } else {
      removeInfoMessage(INFO_MESSAGE_AMOUNT_CURRENCY_ERROR)
    }
  }, [amount, t, addInfoMessage, removeInfoMessage])

  return {
    id: id ?? '',
    paymentId: paymentId ?? '',
    currency: currency ?? CURRENCY_USD_SYMBOL,
    amount: tryParseFloat(amount) ?? 0
  }
}
