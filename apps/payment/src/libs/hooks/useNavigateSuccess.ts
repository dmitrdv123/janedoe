import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ApiWrapper } from '../services/api-wrapper'
import useApiRequest from './useApiRequest'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_SUCCESS_ERROR } from '../../constants'
import usePaymentData from './usePaymentData'

export default function useNavigateSuccess(blockchain?: string | undefined, email?: string | undefined) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { id, paymentId, amount, currency } = usePaymentData()
  const { process: success } = useApiRequest()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const successCallbackHandler = useCallback((txId?: string) => {
    const handler = async () => {
      removeInfoMessage(INFO_MESSAGE_PAYMENT_SUCCESS_ERROR)
      try {
        if (id && blockchain && txId && currency && amount && email) {
          await success(
            ApiWrapper.instance.successRequest(
              id,
              paymentId,
              blockchain,
              txId,
              0,
              currency,
              amount,
              i18n.resolvedLanguage ?? 'EN',
              email
            )
          )
        }
      } catch (error) {
        addInfoMessage(t('hooks.navigate_success.errors.send_error'), INFO_MESSAGE_PAYMENT_SUCCESS_ERROR, 'danger', error)
      }

      navigate(`/success/${id}/${paymentId}/${currency}/${amount}${txId ? `?txId=${txId}` : ''}`)
    }

    handler()
  }, [blockchain, email, amount, currency, id, paymentId, t, i18n.resolvedLanguage, navigate, success, addInfoMessage, removeInfoMessage])

  return successCallbackHandler
}
