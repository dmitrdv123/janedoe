import React, { useEffect, useState } from 'react'
import { Button, OverlayTrigger, Popover, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Filter, FilterCircleFill } from 'react-bootstrap-icons'

import { isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'
import { PaymentHistoryDirection } from '../../../../types/payment-history'

interface TableFilterDetailsProps {
  id: string
  paymentId: string
  transactionHash: string
  from: string
  to: string
  direction: PaymentHistoryDirection | null
  onChange: (paymentId: string, transactionHash: string, from: string, to: string, direction: PaymentHistoryDirection | null) => void
}

const TableFilterDetails: React.FC<TableFilterDetailsProps> = (props) => {
  const [paymentId, setPaymentId] = useState<string>('')
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [direction, setDirection] = useState<PaymentHistoryDirection | null>(null)
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setPaymentId(props.paymentId)
  }, [props.paymentId])

  useEffect(() => {
    setTransactionHash(props.transactionHash)
  }, [props.transactionHash])

  useEffect(() => {
    setFrom(props.from)
  }, [props.from])

  useEffect(() => {
    setTo(props.to)
  }, [props.to])

  useEffect(() => {
    setDirection(props.direction)
  }, [props.direction])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = () => {
    handleToggle()
    props.onChange(paymentId, transactionHash, from, to, direction)
  }

  const clearHandler = () => {
    setPaymentId('')
    setTransactionHash('')
    setFrom('')
    setTo('')
    setDirection(null)
  }

  return (
    <OverlayTrigger
      show={show}
      onToggle={handleToggle}
      trigger="click"
      key={`filter_${props.id}`}
      placement="bottom"
      rootClose
      overlay={
        <Popover id={`popover_${props.id}`}>
          <Popover.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.payment_id')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.payment_id_placeholder')} onChange={e => setPaymentId(e.target.value)} value={paymentId} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.tran_hash')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.tran_hash_placeholder')} onChange={e => setTransactionHash(e.target.value)} value={transactionHash} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.from')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.from_placeholder')} onChange={e => setFrom(e.target.value)} value={from} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.to')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.to_placeholder')} onChange={e => setTo(e.target.value)} value={to} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.direction')}
              </Form.Label>
              <Form.Control as="select" className='mb-3' onChange={e => setDirection(e.target.value ? e.target.value as PaymentHistoryDirection : null)} value={direction ?? ''}>
                <option value="">{t('components.payments.direction_placeholder')}</option>
                <option value="incoming">{t('components.payments.incoming')}</option>
                <option value="outgoing">{t('components.payments.outgoing')}</option>
              </Form.Control>
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
        {(isNullOrEmptyOrWhitespaces(props.paymentId) && isNullOrEmptyOrWhitespaces(props.transactionHash) && isNullOrEmptyOrWhitespaces(props.from) && isNullOrEmptyOrWhitespaces(props.to) && props.direction === null) && (
          <Filter />
        )}
        {(!isNullOrEmptyOrWhitespaces(props.paymentId) || !isNullOrEmptyOrWhitespaces(props.transactionHash) || !isNullOrEmptyOrWhitespaces(props.from) || !isNullOrEmptyOrWhitespaces(props.to) || props.direction !== null) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterDetails
