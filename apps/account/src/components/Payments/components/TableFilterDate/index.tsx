import React, { useEffect, useState } from 'react'
import { Button, OverlayTrigger, Popover, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Filter, FilterCircleFill } from 'react-bootstrap-icons'

import { isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'

interface TableFilterDateProps {
  id: string
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

const TableFilterDate: React.FC<TableFilterDateProps> = (props) => {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setFrom(props.from)
  }, [props.from])

  useEffect(() => {
    setTo(props.to)
  }, [props.to])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = () => {
    handleToggle()
    props.onChange(from, to)
  }

  const clearHandler = () => {
    setFrom('')
    setTo('')
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
                {t('components.payments.date_from')}
              </Form.Label>
              <Form.Control type="date" className='mb-3' placeholder={t('components.payments.date_from_placeholder')} onChange={e => setFrom(e.target.value)} value={from} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('components.payments.date_to')}
              </Form.Label>
              <Form.Control type="date" className='mb-3' placeholder={t('components.payments.date_to_placeholder')} onChange={e => setTo(e.target.value)} value={to} />
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
        {(isNullOrEmptyOrWhitespaces(props.from) && isNullOrEmptyOrWhitespaces(props.to)) && (
          <Filter />
        )}
        {(!isNullOrEmptyOrWhitespaces(props.from) || !isNullOrEmptyOrWhitespaces(props.to)) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterDate
