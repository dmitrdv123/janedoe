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
import { INFO_MESSAGE_PAYMENT_HISTORY_ERROR } from '../../constants'

const App: React.FC = () => {
  const [fromBlockchain, setFromBlockchain] = useState<BlockchainMeta | undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaymentHistoryChecked, setIsPaymentHistoryChecked] = useState(false)
  const isPaymentHistoryCheckedRef = useRef<boolean>(false)

  const { t } = useTranslation()

  const settings = useSettings()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const { amount: requiredCurrencyAmount } = usePaymentData()

  const navigateSuccessHandler = useNavigateSuccess()
  const loadPaymentHistory = usePaymentHistory()
  const { addInfoMessage, removeInfoMessage, clearInfoMessage } = useInfoMessages()

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta | undefined) => {
    clearInfoMessage()
    setFromBlockchain(blockchainToUpdate)
  }, [clearInfoMessage])

  const processingHandler = useCallback((processing: boolean) => {
    setIsProcessing(processing)
  }, [])

  useEffect(() => {
    const load = async () => {
      removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_ERROR)
      setIsPaymentHistoryChecked(false)

      if (!blockchains || !tokens || !exchangeRate || isPaymentHistoryCheckedRef.current) {
        return
      }

      try {
        isPaymentHistoryCheckedRef.current = true
        const result = await loadPaymentHistory(blockchains, tokens)
        const totalUsdAmount = result?.reduce((acc, item) => acc + (item.amountUsdAtPaymentTime ?? 0), 0) ?? 0
        const totalCurrencyAmount = exchangeRate * totalUsdAmount
        if (totalCurrencyAmount >= requiredCurrencyAmount) {
          navigateSuccessHandler()
        }
      } catch (error) {
        addInfoMessage(t('pages.payment_status.errors.payment_history_load_error'), INFO_MESSAGE_PAYMENT_HISTORY_ERROR, 'warning', error)
      } finally {
        setIsPaymentHistoryChecked(true)
      }
    }

    load()
  }, [blockchains, tokens, exchangeRate, requiredCurrencyAmount, loadPaymentHistory, navigateSuccessHandler, removeInfoMessage, addInfoMessage, t])

  return (
    <>
      <MetaUpdater />
      <SettingsUpdater />

      <PaymentNavbar />

      <main>
        <Container className="payment-container">
          <InfoMessages />

          <div className='mb-2 mt-2'>
            <PaymentSummary />
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
                <BlockchainButton blockchain={fromBlockchain} disabled={isProcessing} onUpdate={selectBlockchainHandler} />
              </div>

              {(fromBlockchain?.type === TransactionType.EVM) && (
                <EvmPayment blockchain={fromBlockchain} onProcessing={processingHandler} />
              )}

              {(fromBlockchain?.type === TransactionType.TRANSFER) && (
                <TransferPayment blockchain={fromBlockchain} />
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
