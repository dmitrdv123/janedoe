import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { Form, InputGroup, ListGroup, Modal, Image, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-bootstrap-icons'
import { BlockchainMeta } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { ApplicationModal } from '../../../../types/application-modal'
import { useModalIsOpen, useToggleModal } from '../../../../states/application/hook'
import { findBlockchainByName, isNullOrEmptyOrWhitespaces, stringComparator } from '../../../../libs/utils'
import useBlockchainsDb from '../../../../libs/hooks/useBlockchainsDB'
import { blockchainSchema } from '../../../../types/orama'

interface PaymentBlockchainsModalProps {
  blockchains: BlockchainMeta[] | undefined
  onUpdate: (blockchain: BlockchainMeta) => void
}

const PaymentBlockchainsModal: React.FC<PaymentBlockchainsModalProps> = (props) => {
  const {blockchains, onUpdate} = props

  const [results, setResults] = useState<BlockchainMeta[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)

  const { t } = useTranslation()

  const modalOpen = useModalIsOpen(ApplicationModal.BLOCKCHAIN_PAYMENT)
  const toggleModal = useToggleModal(ApplicationModal.BLOCKCHAIN_PAYMENT)

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
        .map(item => blockchains ? findBlockchainByName(blockchains, item.document.name) : undefined)
        .filter(item => !!item) as BlockchainMeta[]

      setResults(preparedResults)
    }

    if (blockchainsDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchBlockchains(blockchainsDb, deferredQuery)
    } else {
      setResults(blockchains)
    }
  }, [blockchains, blockchainsDb, deferredQuery])

  const blockchainSelectHandler = useCallback((blockchainToUse: BlockchainMeta) => {
    toggleModal()
    onUpdate(blockchainToUse)
  }, [onUpdate, toggleModal])

  return (
    <Modal show={modalOpen} onHide={toggleModal} className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>
          {t('components.payment_settings.blockchain_modal_title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={t('components.payment_settings.blockchain_modal_search_placeholder')}
              onChange={e => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoFocus={true}
            />
            <InputGroup.Text><Search /></InputGroup.Text>
          </InputGroup>
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
                {t('common.nothing_found')}
              </div>
            </ListGroup.Item>
          )}

          {(!!results && results.length > 0) && (
            results.map(result =>
              <ListGroup.Item
                action
                key={result.name}
                onClick={() => blockchainSelectHandler(result)}
                className="d-flex justify-content-between align-items-start blockchain-modal-list-group"
              >
                <div className='d-flex align-items-center'>
                  <Image srcSet={result.logo} alt="..." style={{ width: '45px', height: '45px' }} />
                  <div className='ms-3'>
                    <p className='fw-bold mb-1'>{result.displayName}</p>
                    <p className='text-muted mb-0'>{result.name}</p>
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

export default PaymentBlockchainsModal
