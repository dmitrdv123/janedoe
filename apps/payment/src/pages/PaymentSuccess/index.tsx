import React, { useEffect, useRef, useState } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import './index.css'

import SettingsLoader from '../../states/settings/loader'
import PaymentNavbar from '../../components/PaymentNavbar'
import usePaymentData from '../../libs/hooks/usePaymentData'
import PaymentSummary from '../../components/PaymentSummary'
import InfoMessages from '../../components/InfoMessages'
import usePaymentHistory from '../../libs/hooks/usePaymentHistory'
import { useBlockchains, useExchangeRate, useTokens } from '../../states/settings/hook'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_HISTORY_ERROR } from '../../constants'

const PaymentStatus: React.FC = () => {
  const [receivedCurrencyAmount, setReceivedCurrencyAmount] = useState(0)
  const isPaymentHistoryLoadingRef = useRef(false)

  const { t } = useTranslation()

  const loadPaymentHistory = usePaymentHistory()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const { id, paymentId, currency, amount } = usePaymentData()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    const load = async () => {
      removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_ERROR)

      if (!blockchains || !tokens || !exchangeRate || isPaymentHistoryLoadingRef.current) {
        return
      }

      try {
        isPaymentHistoryLoadingRef.current = true
        const result = await loadPaymentHistory(blockchains, tokens)
        const amountUsd = result?.reduce((acc, item) => acc + (item.amountUsdAtPaymentTime ?? 0), 0) ?? 0
        const amountCurrency = exchangeRate * amountUsd
        setReceivedCurrencyAmount(amountCurrency)
      } catch (error) {
        addInfoMessage(t('pages.payment_status.errors.payment_history_load_error'), INFO_MESSAGE_PAYMENT_HISTORY_ERROR, 'warning', error)
      }
    }

    load()
  }, [t, tokens, blockchains, exchangeRate, loadPaymentHistory, addInfoMessage, removeInfoMessage])

  return (
    <>
      <SettingsLoader />

      <PaymentNavbar />

      <main>
        <Container>
        <InfoMessages />

          <div className='mb-2 mt-2'>
            <PaymentSummary receivedCurrencyAmount={receivedCurrencyAmount} />
          </div>

          <Alert variant="success">
            {t('pages.payment_success.success_desc')}&nbsp;
            <a href={`/status/${id}/${paymentId}/${currency}/${amount}`}>
              {t('pages.payment_success.link_details')}
            </a>
          </Alert>
        </Container>
      </main>
    </>
  )
}

export default PaymentStatus
