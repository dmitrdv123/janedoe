import React, { useCallback, useState } from 'react'
import { Container, Form, Spinner } from 'react-bootstrap'
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

const App: React.FC = () => {
  const [fromBlockchain, setFromBlockchain] = useState<BlockchainMeta | undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState(false)

  const { t } = useTranslation()

  const settings = useSettings()

  const { clearInfoMessage } = useInfoMessages()

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta | undefined) => {
    clearInfoMessage()
    setFromBlockchain(blockchainToUpdate)
  }, [clearInfoMessage])

  const processingHandler = useCallback((processing: boolean) => {
    setIsProcessing(processing)
  }, [])

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

          {!settings.current && (
            <div className="mb-2 d-flex justify-content-center">
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                <span className="visually-hidden">{t('common.loading')}</span>
              </Spinner>
            </div>
          )}

          {settings.current && (
            <Form>
              <div className="mb-2">
                <BlockchainButton blockchain={fromBlockchain} disabled={isProcessing} onUpdate={selectBlockchainHandler}/>
              </div>

              {(fromBlockchain?.type === TransactionType.EVM) && (
                <EvmPayment blockchain={fromBlockchain} onProcessing={processingHandler}/>
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
