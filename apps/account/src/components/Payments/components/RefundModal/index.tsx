import { useCallback, useState } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useModalIsOpen, useToggleModal } from '../../../../states/application/hook'
import { ApplicationModal } from '../../../../types/application-modal'
import { PaymentHistoryData } from '../../../../types/payment-history'
import { RefundResult } from '../../../../types/refund-result'
import RbacGuard from '../../../Guards/RbacGuard'
import RefundModalButton from '../RefundModalButton'
import CurrencyAmount from '../../../CurrencyAmount'
import { CURRENCY_USD_SYMBOL } from '../../../../constants'

interface RefundModalProps {
  paymentHistory: PaymentHistoryData | undefined
  onUpdate: (paymentHistoryToUse: PaymentHistoryData, refundResult: RefundResult) => void
}

const RefundModal: React.FC<RefundModalProps> = (props) => {
  const { paymentHistory, onUpdate } = props

  const [refundAddress, setRefundAddress] = useState<string | undefined>(paymentHistory?.to)
  const [refundAmount, setRefundAmount] = useState<string | undefined>(paymentHistory?.amount)

  const { t } = useTranslation()

  const modalOpen = useModalIsOpen(ApplicationModal.REFUND)
  const toggleModal = useToggleModal(ApplicationModal.REFUND)

  const updateHandler = useCallback((refundResultToUse: RefundResult) => {
    if (paymentHistory) {
      onUpdate(paymentHistory, refundResultToUse)
    }
  }, [onUpdate, paymentHistory])

  return (
    <Modal show={modalOpen} onHide={toggleModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {t('components.payments.refund_modal_title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        {(!!paymentHistory) && (
          <Form>
            <Form.Group>
              <Form.Label>{t('components.payments.refund_address')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('components.payments.refund_address_placeholder')}
                onChange={event => setRefundAddress(event.target.value)}
                value={refundAddress ?? ''}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>{t('components.payments.refund_amount')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('components.payments.refund_amount_placeholder')}
                onChange={event => setRefundAmount(event.target.value)}
                value={refundAmount ?? ''}
              />
              {(paymentHistory.currency?.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
                <Form.Text muted className='me-1'>
                  <CurrencyAmount
                    amount={paymentHistory.amountCurrencyAtCurTime}
                    currency={paymentHistory.currency}
                  />
                </Form.Text>
              )}
              <Form.Text muted>
                <CurrencyAmount
                  amount={paymentHistory.amountUsdAtCurTime}
                  currency={CURRENCY_USD_SYMBOL}
                />
              </Form.Text>
            </Form.Group>

            <RbacGuard requiredKeys={['balances']} requiredPermission='Modify' element={
              <RefundModalButton
                paymentId={paymentHistory.paymentId}
                blockchain={paymentHistory.blockchain ?? undefined}
                refundAddress={refundAddress}
                refundAmount={refundAmount}
                onUpdate={updateHandler}
              />
            } />
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default RefundModal
