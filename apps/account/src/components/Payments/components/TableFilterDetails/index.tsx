import React, { useCallback, useEffect, useState } from 'react'
import { Button, OverlayTrigger, Popover, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Filter, FilterCircleFill } from 'react-bootstrap-icons'

import { isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'
import { PaymentHistoryDirection } from '../../../../types/payment-history'

interface TableFilterDetailsProps {
  id: string
  transaction: string
  from: string
  to: string
  direction: PaymentHistoryDirection | null
  onChange: (transaction: string, from: string, to: string, direction: PaymentHistoryDirection | null) => void
}

const TableFilterDetails: React.FC<TableFilterDetailsProps> = (props) => {
  const { id, transaction, from, to, direction, onChange } = props

  const [selectedTransaction, setSelectedTransaction] = useState<string>('')
  const [selectedFrom, setSelectedFrom] = useState<string>('')
  const [selectedTo, setSelectedTo] = useState<string>('')
  const [selectedDirection, setSelectedDirection] = useState<PaymentHistoryDirection | null>(null)
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setSelectedTransaction(transaction)
  }, [transaction])

  useEffect(() => {
    setSelectedFrom(from)
  }, [from])

  useEffect(() => {
    setSelectedTo(to)
  }, [to])

  useEffect(() => {
    setSelectedDirection(direction)
  }, [direction])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = useCallback(() => {
    handleToggle()
    onChange(selectedTransaction, selectedFrom, selectedTo, selectedDirection)
  }, [selectedDirection, selectedFrom, selectedTo, selectedTransaction, onChange])

  const clearHandler = () => {
    setSelectedTransaction('')
    setSelectedFrom('')
    setSelectedTo('')
    setSelectedDirection(null)
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
                {t('components.payments.tran_hash')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.tran_hash_placeholder')} onChange={e => setSelectedTransaction(e.target.value)} value={selectedTransaction} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.from')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.from_placeholder')} onChange={e => setSelectedFrom(e.target.value)} value={selectedFrom} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.to')}
              </Form.Label>
              <Form.Control type="text" className='mb-3' placeholder={t('components.payments.to_placeholder')} onChange={e => setSelectedTo(e.target.value)} value={selectedTo} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.direction')}
              </Form.Label>
              <Form.Control as="select" className='mb-3' onChange={e => setSelectedDirection(e.target.value ? e.target.value as PaymentHistoryDirection : null)} value={selectedDirection ?? ''}>
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
        {(isNullOrEmptyOrWhitespaces(selectedTransaction) && isNullOrEmptyOrWhitespaces(selectedFrom) && isNullOrEmptyOrWhitespaces(selectedTo) && selectedDirection === null) && (
          <Filter />
        )}
        {(!isNullOrEmptyOrWhitespaces(selectedTransaction) || !isNullOrEmptyOrWhitespaces(selectedFrom) || !isNullOrEmptyOrWhitespaces(selectedTo) || selectedDirection !== null) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterDetails
