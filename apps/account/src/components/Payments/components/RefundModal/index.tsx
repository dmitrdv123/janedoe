import { useCallback, useEffect, useState } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useModalIsOpen, useToggleModal } from '../../../../states/application/hook'
import { ApplicationModal } from '../../../../types/application-modal'
import { PaymentHistoryData } from '../../../../types/payment-history'
import RbacGuard from '../../../Guards/RbacGuard'
import RefundModalButton from '../RefundModalButton'
import CurrencyAmount from '../../../CurrencyAmount'
import { CURRENCY_USD_SYMBOL } from '../../../../constants'
import { formatToFixed, parseToBigNumber } from '../../../../libs/utils'

interface RefundModalProps {
  paymentHistory: PaymentHistoryData | undefined
  onSuccess: (paymentHistory: PaymentHistoryData, hash: string | undefined) => void
}

const RefundModal: React.FC<RefundModalProps> = (props) => {
  const { paymentHistory, onSuccess } = props

  const [refundAddress, setRefundAddress] = useState<string | undefined>(undefined)
  const [refundAmount, setRefundAmount] = useState<string | undefined>(undefined)

  const { t } = useTranslation()

  const modalOpen = useModalIsOpen(ApplicationModal.REFUND)
  const toggleModal = useToggleModal(ApplicationModal.REFUND)

  const successHandler = useCallback((paymentHistoryToUse: PaymentHistoryData, hashToUse: string | undefined) => {
    toggleModal()
    onSuccess(paymentHistoryToUse, hashToUse)
  }, [toggleModal, onSuccess])

  const changeRefundAmountHandler = useCallback((amountToUse: string, decimalsToUse: number | null) => {
    if (!decimalsToUse) {
      setRefundAmount(amountToUse)
    } else {
      const amountNum = parseFloat(amountToUse)
      const amountBigInt = parseToBigNumber(amountNum, decimalsToUse)
      setRefundAmount(amountBigInt.toString())
    }
  }, [])

  useEffect(() => {
    setRefundAddress(paymentHistory?.from ?? '')
    setRefundAmount(paymentHistory?.amount ?? '')
  }, [paymentHistory?.amount, paymentHistory?.from])

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
                onChange={event => changeRefundAmountHandler(event.target.value, paymentHistory.tokenDecimals)}
                value={refundAmount && paymentHistory.tokenDecimals ? formatToFixed(refundAmount, paymentHistory.tokenDecimals) : refundAmount}
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
                paymentHistory={paymentHistory}
                refundAddress={refundAddress}
                refundAmount={refundAmount}
                onSuccess={successHandler}
              />
            } />
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default RefundModal
