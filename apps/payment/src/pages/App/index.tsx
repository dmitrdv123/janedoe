import React, { useCallback, useEffect, useState } from 'react'
import { Container, Form, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'

import './index.css'

import { useInfoMessages } from '../../states/application/hook'
import MetaUpdater from '../../states/settings/updater'
import PaymentNavbar from '../../components/PaymentNavbar'
import { useSettings } from '../../states/settings/hook'
import SettingsUpdater from '../../states/settings/updater'
import UpdateTimer from '../../components/UpdateTimer'
import BlockchainButton from '../../components/BlockchainButton'
import EvmPayment from '../../components/EvmPayment'
import TransferPayment from '../../components/TransferPayment'
import PaymentSummary from '../../components/PaymentSummary'
import InfoMessages from '../../components/InfoMessages'
import { DEFAULT_CURRENCY_DECIMAL_PLACES } from '../../constants'
import { roundNumber } from '../../libs/utils'
import usePaymentData from '../../libs/hooks/usePaymentData'
import usePaymentRestAmount from '../../libs/hooks/usePaymentRestAmount'

const App: React.FC = () => {
  const [fromBlockchain, setFromBlockchain] = useState<BlockchainMeta | undefined>(undefined)

  const { t } = useTranslation()
  const navigate = useNavigate()

  const { id, paymentId, amount, currency } = usePaymentData()
  const settings = useSettings()
  const { restCurrencyAmount, receivedCurrencyAmount, status } = usePaymentRestAmount()
  const { clearInfoMessage } = useInfoMessages()

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta | undefined) => {
    clearInfoMessage()
    setFromBlockchain(blockchainToUpdate)
  }, [clearInfoMessage])

  useEffect(() => {
    if (status === 'success' && roundNumber(restCurrencyAmount, DEFAULT_CURRENCY_DECIMAL_PLACES) === 0) {
      navigate(`/success/${id}/${paymentId}/${currency}/${amount}`)
    }
  }, [amount, currency, id, paymentId, restCurrencyAmount, status, navigate])

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

          {(!settings.current || !['success', 'error'].includes(status)) && (
            <div className="mb-2 d-flex justify-content-center">
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                <span className="visually-hidden">{t('common.loading')}</span>
              </Spinner>
            </div>
          )}

          {(settings.current && !!['success', 'error'].includes(status)) && (
            <Form>
              <div className="mb-2">
                <BlockchainButton blockchain={fromBlockchain} onUpdate={selectBlockchainHandler} />
              </div>

              {(fromBlockchain?.type === TransactionType.EVM) && (
                <EvmPayment blockchain={fromBlockchain} restCurrencyAmount={restCurrencyAmount} receivedCurrencyAmount={receivedCurrencyAmount} />
              )}

              {(fromBlockchain?.type === TransactionType.TRANSFER) && (
                <TransferPayment blockchain={fromBlockchain} restCurrencyAmount={restCurrencyAmount} receivedCurrencyAmount={receivedCurrencyAmount} />
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
