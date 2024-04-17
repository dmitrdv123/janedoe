import React, { useEffect, useState } from 'react'
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
  const [value, setValue] = useState<string>('')
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    setValue(props.value)
  }, [props.value, setValue])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = () => {
    handleToggle()
    props.onChange(value)
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
            <Form.Control type="text" className='mb-3' placeholder={props.placeholder} onChange={e => setValue(e.target.value)} value={value} />
            <Button variant="primary" onClick={applyHandler}>
              {t('common.apply_btn')}
            </Button>
            <Button variant="secondary" className='ms-3' onClick={() => setValue('')}>
              {t('common.clear_btn')}
            </Button>
          </Popover.Body>
        </Popover>
      }
    >
      <Button variant='link' size='sm' className="text-dark pt-0 pb-0">
        {isNullOrEmptyOrWhitespaces(props.value) && (
          <Filter />
        )}
        {!isNullOrEmptyOrWhitespaces(props.value) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterText
