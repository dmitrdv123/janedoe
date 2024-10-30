import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Button, OverlayTrigger, Popover, Form, InputGroup, ListGroup, Spinner, Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Filter, FilterCircleFill, Search } from 'react-bootstrap-icons'
import { BlockchainMeta } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useBlockchains } from '../../../../states/meta/hook'
import { useSettings } from '../../../../states/settings/hook'
import useBlockchainsDb from '../../../../libs/hooks/useBlockchainsDB'
import { findBlockchainByName, isNullOrEmptyOrWhitespaces, stringComparator } from '../../../../libs/utils'
import { blockchainSchema } from '../../../../types/orama'

interface TableFilterBlockchainProps {
  id: string
  blockchains: string[]
  onChange: (blockchains: string[]) => void
}

const TableFilterBlockchain: React.FC<TableFilterBlockchainProps> = (props) => {
  const [results, setResults] = useState<BlockchainMeta[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [selectedBlockchains, setSelectedBlockchains] = useState<string[]>([])
  const [show, setShow] = React.useState(false)

  const { t } = useTranslation()
  const settings = useSettings()
  const blockchains = useBlockchains()

  const preparedBlockchains = useMemo(() => {
    if (!settings.current || !blockchains) {
      return undefined
    }

    return settings.current.paymentBlockchains
      .map(item =>
        blockchains?.find(blockchain => blockchain.name.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase())
      )
      .filter(item => !!item)
      .sort((a, b) => stringComparator((a as BlockchainMeta).displayName, (b as BlockchainMeta).displayName)) as BlockchainMeta[]
  }, [settings, blockchains])

  const blockchainsDb = useBlockchainsDb(preparedBlockchains)

  useEffect(() => {
    const searchBlockchains = async (blockchainsDb: Orama<typeof blockchainSchema>, query: string) => {
      const result = await search(blockchainsDb, {
        term: query,
        properties: ['name', 'displayName']
      })

      const preparedResults = result.hits
        .sort((a, b) => {
          if (a.score < b.score) {
            return 1
          }

          if (a.score > b.score) {
            return -1
          }

          return stringComparator(a.document.displayName, a.document.displayName)
        })
        .map(item => preparedBlockchains ? findBlockchainByName(preparedBlockchains, item.document.name) : undefined)
        .filter(item => item) as BlockchainMeta[]

      setResults(preparedResults)
    }

    if (blockchainsDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchBlockchains(blockchainsDb, deferredQuery)
    } else {
      setResults(preparedBlockchains)
    }
  }, [preparedBlockchains, blockchainsDb, deferredQuery])

  useEffect(() => {
    setSelectedBlockchains(props.blockchains)
  }, [props.blockchains, setSelectedBlockchains])

  const handleToggle = () => {
    setShow((prev) => !prev);
  }

  const applyHandler = useCallback(() => {
    handleToggle()
    props.onChange(selectedBlockchains)
  }, [props, selectedBlockchains])

  const clearHandler = () => {
    setSelectedBlockchains([])
  }

  const blockchainSelectHandler = useCallback((blockchain: string) => {
    const arr = selectedBlockchains.filter(item => item.toLocaleLowerCase() !== blockchain.toLocaleLowerCase())
    if (arr.length !== selectedBlockchains.length) {
      setSelectedBlockchains(arr)
    } else {
      setSelectedBlockchains([...selectedBlockchains, blockchain])
    }
  }, [selectedBlockchains])

  const isActive = useCallback((blockchain: string) => {
    return !!selectedBlockchains.find(item => item.toLocaleLowerCase() === blockchain.toLocaleLowerCase())
  }, [selectedBlockchains])

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
            <InputGroup className="mb-3">
              <Form.Control
                placeholder={t('components.payments.blockchain_filter_search_placeholder')}
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              <InputGroup.Text><Search /></InputGroup.Text>
            </InputGroup>

            <ListGroup className="overflow-auto rounded-0 popover-list-group mb-3">
              {!results && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                  <span className="visually-hidden">{t('common.processing')}</span>
                </Spinner>
              )}

              {(!!results && results.length === 0) && (
                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                  <div className='d-flex align-items-center'>
                    {t('common.nothing_found')}
                  </div>
                </ListGroup.Item>
              )}

              {(!!results && results.length > 0) && (
                results.map(item => (
                  <ListGroup.Item action active={isActive(item.name)} key={item.name} onClick={() => blockchainSelectHandler(item.name)} className="d-flex justify-content-between align-items-start">
                    <div className='d-flex align-items-center'>
                      <Image srcSet={item.logo} alt="..." style={{ width: '45px', height: '45px' }} />
                      <div className='ms-3'>
                        <p className='fw-bold mb-1'>{item.displayName}</p>
                        <p className='text-muted mb-0'>{item.name}</p>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>

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
        {(props.blockchains.length === 0) && (
          <Filter />
        )}
        {(props.blockchains.length !== 0) && (
          <FilterCircleFill />
        )}
      </Button>
    </OverlayTrigger>
  )
}

export default TableFilterBlockchain
