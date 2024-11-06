import React, { useCallback, useEffect, useState } from 'react'
import { Button, OverlayTrigger, Popover, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Filter, FilterCircleFill } from 'react-bootstrap-icons'

import { isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'

interface TableFilterPaymentProps {
  id: string
  paymentId: string
  comment: string
  onChange: (paymentId: string, comment: string) => void
}

const TableFilterPayment: React.FC<TableFilterPaymentProps> = (props) => {
  const { id, paymentId, comment, onChange } = props

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('')
  const [selectedComment, setSelectedComment] = useState<string>('')
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setSelectedPaymentId(paymentId)
  }, [paymentId])

  useEffect(() => {
    setSelectedComment(comment)
  }, [comment])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = useCallback(() => {
    handleToggle()
    onChange(selectedPaymentId, selectedComment)
  }, [selectedComment, selectedPaymentId, onChange])

  const clearHandler = () => {
    setSelectedPaymentId('')
    setSelectedComment('')
  }

  return (
    <OverlayTrigger
      show={show}
      onToggle={handleToggle}
      trigger="click"
      key={`filter_${id}`}
      placement="bottom"
      rootClose
      overlay={
        <Popover id={`popover_${id}`}>
          <Popover.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.payment_id')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.payment_id_placeholder')} onChange={e => setSelectedPaymentId(e.target.value)} value={selectedPaymentId} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.payment_comment')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.payment_comment_placeholder')} onChange={e => setSelectedComment(e.target.value)} value={selectedComment} />
            </Form.Group>

            <Button variant="primary" onClick={applyHandler}>
              {t('common.apply_btn')}
            </Button>
            <Button variant="secondary" className='ms-3' onClick={clearHandler}>
              {t('common.clear_btn')}
            </Button>
          </Popover.Body>
        </Popover>
      }
    >
      <Button variant='link' size='sm' className="text-dark pt-0 pb-0">
        {(isNullOrEmptyOrWhitespaces(selectedPaymentId) && isNullOrEmptyOrWhitespaces(selectedComment)) && (
          <Filter />
        )}
        {(!isNullOrEmptyOrWhitespaces(selectedPaymentId) || !isNullOrEmptyOrWhitespaces(selectedComment)) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterPayment
