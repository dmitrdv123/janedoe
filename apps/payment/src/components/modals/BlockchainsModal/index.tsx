import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Form, InputGroup, ListGroup, Modal, Image, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-bootstrap-icons'
import { BlockchainMeta } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useModalIsOpen, useToggleModal } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'
import { findBlockchainByName, isNullOrEmptyOrWhitespaces, stringComparator } from '../../../libs/utils'
import useBlockchainsDb from '../../../libs/hooks/useBlockchainsDB'
import { usePaymentSettings } from '../../../states/settings/hook'
import { blockchainSchema } from '../../../types/orama'

interface BlockchainsModalProps {
  selectedBlockchain: BlockchainMeta | undefined
  blockchains: BlockchainMeta[]
  onUpdate: (blockchain: BlockchainMeta) => void
}

const BlockchainsModal: React.FC<BlockchainsModalProps> = (props) => {
  const { selectedBlockchain, blockchains, onUpdate } = props

  const [results, setResults] = useState<BlockchainMeta[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [withoutConversion, setWithoutConversion] = useState<boolean>(false)

  const { t } = useTranslation()

  const modalOpen = useModalIsOpen(ApplicationModal.BLOCKCHAIN)
  const toggleModal = useToggleModal(ApplicationModal.BLOCKCHAIN)
  const paymentSettings = usePaymentSettings()

  const preparedBlockchains = useMemo(() => {
    return paymentSettings?.disableConversion
      ? blockchains
        .filter(blockchain => paymentSettings?.wallets.find(
          wallet => wallet.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
        ))
        .sort((a, b) => stringComparator(a.displayName, b.displayName))
      : blockchains
        .sort((a, b) => stringComparator(a.displayName, b.displayName))
  }, [blockchains, paymentSettings?.disableConversion, paymentSettings?.wallets])

  const blockchainsDb = useBlockchainsDb(blockchains)

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
        .map(item => findBlockchainByName(preparedBlockchains, item.document.name as string))
        .filter(item => {
          if (!item) {
            return false
          }

          if (withoutConversion) {
            return paymentSettings?.wallets.find(
              wallet => wallet.blockchain.toLocaleLowerCase() === item.name.toLocaleLowerCase()
            )
          }

          return true
        }) as BlockchainMeta[]

      setResults(preparedResults)
    }

    if (blockchainsDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchBlockchains(blockchainsDb, deferredQuery)
    } else {
      const preparedResults = withoutConversion
        ? preparedBlockchains.filter(
          item => paymentSettings?.wallets.find(wallet => wallet.blockchain.toLocaleLowerCase() === item.name.toLocaleLowerCase())
        )
        : preparedBlockchains

      setResults(preparedResults)
    }
  }, [preparedBlockchains, blockchainsDb, deferredQuery, paymentSettings?.wallets, withoutConversion])

  const blockchainSelectHandler = useCallback((blockchain: BlockchainMeta) => {
    toggleModal()
    onUpdate(blockchain)
  }, [toggleModal, onUpdate])

  const isActive = useCallback((blockchain: BlockchainMeta) => {
    return selectedBlockchain?.name.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
  }, [selectedBlockchain])

  return (
    <Modal show={modalOpen} onHide={toggleModal} className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>
          {t('components.blockchain_modal.title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={t('components.blockchain_modal.search_placeholder')}
              onChange={e => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoFocus={true}
            />
            <InputGroup.Text><Search /></InputGroup.Text>
          </InputGroup>

          {!paymentSettings?.disableConversion && (
            <Form.Group>
              <Form.Check type='checkbox' label={t('components.blockchain_modal.conversion_checkbox')} checked={withoutConversion} onChange={e => setWithoutConversion(e.target.checked)} />
              <Form.Text className="text-muted">
                {t('components.blockchain_modal.conversion_checkbox_desc')}
              </Form.Text>
            </Form.Group>
          )}
        </div>

        <ListGroup className="overflow-auto rounded-0 modal-list-group">
          {(!results) && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
              <span className="visually-hidden">{t('common.processing')}</span>
            </Spinner>
          )}

          {(!!results && results.length === 0) && (
            <ListGroup.Item className="d-flex justify-content-between align-items-start">
              <div className='d-flex align-items-center'>
                {t('common.nothing')}
              </div>
            </ListGroup.Item>
          )}

          {(!!results && results.length > 0) && (
            results.map(result =>
              <ListGroup.Item
                action
                key={result.name}
                onClick={() => blockchainSelectHandler(result)}
                className="d-flex justify-content-between align-items-start" active={isActive(result)}
              >
                <div className='d-flex align-items-center'>
                  <Image srcSet={result.logo} alt="..." style={{ width: '45px', height: '45px' }} />
                  <div className='ms-3'>
                    <p className='fw-bold mb-1'>{result.displayName}</p>
                    <p className={isActive(result) ? 'mb-0' : 'text-muted mb-0'}>{result.name}</p>
                  </div>
                </div>
              </ListGroup.Item>
            )
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  )
}

export default BlockchainsModal
