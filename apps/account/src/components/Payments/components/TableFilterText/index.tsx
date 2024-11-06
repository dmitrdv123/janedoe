import React, { useCallback, useEffect, useState } from 'react'
import { Button, OverlayTrigger, Popover, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Filter, FilterCircleFill } from 'react-bootstrap-icons'

import { isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'

interface TableFilterTextProps {
  id: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

const TableFilterText: React.FC<TableFilterTextProps> = (props) => {
  const { id, placeholder, value, onChange } = props

  const [selectedValue, setSelectedValue] = useState<string>('')
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setSelectedValue(value)
  }, [value, setSelectedValue])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = useCallback(() => {
    handleToggle()
    onChange(selectedValue)
  }, [selectedValue, onChange])

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
            <Form.Control type="text" className='mb-3' placeholder={placeholder} onChange={e => setSelectedValue(e.target.value)} value={selectedValue} />
            <Button variant="primary" onClick={applyHandler}>
              {t('common.apply_btn')}
            </Button>
            <Button variant="secondary" className='ms-3' onClick={() => setSelectedValue('')}>
              {t('common.clear_btn')}
            </Button>
          </Popover.Body>
        </Popover>
      }
    >
      <Button variant='link' size='sm' className="text-dark pt-0 pb-0">
        {isNullOrEmptyOrWhitespaces(value) && (
          <Filter />
        )}
        {!isNullOrEmptyOrWhitespaces(value) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterText
