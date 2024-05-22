import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Form, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'

import './index.css'

import { useInfoMessages } from '../../states/application/hook'
import MetaUpdater from '../../states/settings/updater'
import PaymentNavbar from '../../components/PaymentNavbar'
import { useBlockchains, useExchangeRate, useSettings, useTokens } from '../../states/settings/hook'
import SettingsUpdater from '../../states/settings/updater'
import UpdateTimer from '../../components/UpdateTimer'
import BlockchainButton from '../../components/BlockchainButton'
import EvmPayment from '../../components/EvmPayment'
import TransferPayment from '../../components/TransferPayment'
import PaymentSummary from '../../components/PaymentSummary'
import InfoMessages from '../../components/InfoMessages'
import usePaymentHistory from '../../libs/hooks/usePaymentHistory'
import useNavigateSuccess from '../../libs/hooks/useNavigateSuccess'
import usePaymentData from '../../libs/hooks/usePaymentData'
import { DEFAULT_CURRENCY_DECIMAL_PLACES, INFO_MESSAGE_PAYMENT_HISTORY_ERROR } from '../../constants'
import { roundNumber } from '../../libs/utils'
import { useInterval } from '../../libs/hooks/useInterval'

const App: React.FC = () => {
  const [fromBlockchain, setFromBlockchain] = useState<BlockchainMeta | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [isPaymentHistoryChecked, setIsPaymentHistoryChecked] = useState(false)
  const [restCurrencyAmount, setRestCurrencyAmount] = useState(0)
  const [receivedCurrencyAmount, setReceivedCurrencyAmount] = useState(0)
  const isPaymentHistoryLoadingRef = useRef(false)

  const { t } = useTranslation()

  const settings = useSettings()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const { amount: requiredCurrencyAmount } = usePaymentData()

  const navigateSuccessHandler = useNavigateSuccess(fromBlockchain?.name, email)
  const loadPaymentHistory = usePaymentHistory()
  const { addInfoMessage, removeInfoMessage, clearInfoMessage } = useInfoMessages()

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta | undefined) => {
    clearInfoMessage()
    setFromBlockchain(blockchainToUpdate)
  }, [clearInfoMessage])

  const emailHandler = useCallback((emailToUpdate: string) => {
    setEmail(emailToUpdate)
  }, [])

  const fetchReceivedAmountHandler = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_ERROR)

    if (!blockchains || !tokens || !exchangeRate) {
      return
    }

    try {
      isPaymentHistoryLoadingRef.current = true
      const result = await loadPaymentHistory(blockchains, tokens)
      const amountUsd = result?.reduce((acc, item) => acc + (item.amountUsdAtPaymentTime ?? 0), 0) ?? 0
      const receivedCurrencyAmountTmp = exchangeRate * amountUsd

      const delta = requiredCurrencyAmount - receivedCurrencyAmountTmp
      const restCurrencyAmountTmp = delta <= 0 ? 0 : delta

      setReceivedCurrencyAmount(receivedCurrencyAmountTmp)
      setRestCurrencyAmount(restCurrencyAmountTmp)

      if (roundNumber(restCurrencyAmountTmp, DEFAULT_CURRENCY_DECIMAL_PLACES) === 0) {
        navigateSuccessHandler()
      }
    } catch (error) {
      setReceivedCurrencyAmount(0)
      setRestCurrencyAmount(requiredCurrencyAmount)

      addInfoMessage(t('pages.payment_status.errors.payment_history_load_error'), INFO_MESSAGE_PAYMENT_HISTORY_ERROR, 'warning', error)
    } finally {
      setIsPaymentHistoryChecked(true)
    }
  }, [blockchains, tokens, exchangeRate, requiredCurrencyAmount, t, loadPaymentHistory, navigateSuccessHandler, removeInfoMessage, addInfoMessage])

  useEffect(() => {
    if (!isPaymentHistoryLoadingRef.current) {
      fetchReceivedAmountHandler()
    }
  }, [fetchReceivedAmountHandler])

  useInterval(fetchReceivedAmountHandler, 1000 * 10)

  return (
    <>
      <MetaUpdater />
      <SettingsUpdater />

      <PaymentNavbar />

      <main>
        <Container className="payment-container">
          <InfoMessages />

          <div className='mb-2 mt-2'>
            <PaymentSummary receivedCurrencyAmount={receivedCurrencyAmount} />
          </div>

          {(!settings.current || !isPaymentHistoryChecked) && (
            <div className="mb-2 d-flex justify-content-center">
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                <span className="visually-hidden">{t('common.loading')}</span>
              </Spinner>
            </div>
          )}

          {(settings.current && isPaymentHistoryChecked) && (
            <Form>
              <div className="mb-2">
                <BlockchainButton blockchain={fromBlockchain} onUpdate={selectBlockchainHandler} />
              </div>

              {(fromBlockchain?.type === TransactionType.EVM) && (
                <EvmPayment blockchain={fromBlockchain} currencyAmount={restCurrencyAmount} onEmailUpdate={emailHandler}/>
              )}

              {(fromBlockchain?.type === TransactionType.TRANSFER) && (
                <TransferPayment blockchain={fromBlockchain} currencyAmount={restCurrencyAmount} onEmailUpdate={emailHandler}/>
              )}
            </Form>
          )}

          <UpdateTimer />

        </Container>
      </main >
    </>
  )
}

export default App
