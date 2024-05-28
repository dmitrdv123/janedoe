import { useEffect, useState, useRef, useCallback, useDeferredValue } from 'react'
import { Form, InputGroup, ListGroup, Modal, Image, Spinner, Alert } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { EVMChainInfo, Token, TransactionType } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useModalIsOpen, useToggleModal } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'
import { PAGE_SIZE } from '../../../constants'
import { findBlockchainByName, isNullOrEmptyOrWhitespaces, sameToken, tokenDefaultResultComparator } from '../../../libs/utils'
import { useBlockchains } from '../../../states/settings/hook'
import { tokenSchema } from '../../../types/orama'
import useTokenDb from '../../../libs/hooks/useTokenDb'

interface ConversionTokensModalProps {
  selectedToken: Token | undefined
  tokens: Token[]
  onUpdate: (token: Token) => void
}

const ConversionTokensModal: React.FC<ConversionTokensModalProps> = (props) => {
  const { selectedToken, tokens, onUpdate } = props

  const { t } = useTranslation()

  const modalOpen = useModalIsOpen(ApplicationModal.CONVERSION_TOKEN)
  const toggleModal = useToggleModal(ApplicationModal.CONVERSION_TOKEN)

  const [results, setResults] = useState<Token[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [pageNum, setPageNum] = useState(1)
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null)

  const blockchains = useBlockchains()
  const tokensDb = useTokenDb(tokens)

  useEffect(() => {
    const searchTokens = async (tokensDb: Orama<typeof tokenSchema>, query: string) => {
      const result = await search(tokensDb, {
        term: query,
        properties: ['symbol', 'name', 'address'],
        boost: {
          symbol: 1.5
        }
      })

      setResults(
        result.hits
          .sort((a, b) => {
            if (a.score < b.score) {
              return 1
            }

            if (a.score > b.score) {
              return -1
            }

            return tokenDefaultResultComparator(a.document, b.document)
          })
          .map(token => token.document)
      )
    }

    if (tokensDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchTokens(tokensDb, deferredQuery)
    } else {
      setResults(tokens)
    }

    setPageNum(1)
  }, [tokens, deferredQuery, tokensDb])

  const observer = useRef(
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPageNum(no => no + 1)
      }
    })
  )

  useEffect(() => {
    const currentElement = lastElement
    const currentObserver = observer.current

    if (currentElement) {
      currentObserver.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement)
      }
    }
  }, [lastElement])

  const tokenSelectHandler = useCallback((token: Token) => {
    toggleModal()
    onUpdate(token)
  }, [onUpdate, toggleModal])

  const isActive = useCallback((token: Token) => {
    return selectedToken && sameToken(token, selectedToken)
  }, [selectedToken])

  const getTokens = useCallback((resultsToShow: Token[]) => {
    return resultsToShow
      .slice(0, pageNum * PAGE_SIZE)
      .map((token, i) => {
        const blockchain = findBlockchainByName(blockchains ?? [], token.blockchain)

        return (
          <ListGroup.Item
            action
            key={[token.blockchain, token.symbol, token.address].join('_')}
            active={isActive(token)}
            disabled={token.usdPrice === null}
            onClick={(e) => {
              if ((e.target as HTMLElement).tagName.toLocaleLowerCase() !== 'a') {
                tokenSelectHandler(token);
              }
            }}
            className="d-flex justify-content-between align-items-start"
          >
            <div className='d-flex align-items-center' ref={i === pageNum * PAGE_SIZE - 1 ? setLastElement : undefined}>
              {token.image && (
                <Image srcSet={token.image} alt="..." style={{ width: '45px', height: '45px' }} className='me-3' />
              )}
              <div>
                <div className='fw-bold'>
                  {token.symbol}
                </div>

                {(blockchain?.type !== TransactionType.EVM || !token.address) && (
                  <div className={isActive(token) ? '' : 'text-muted'}>
                    {token.name} ({blockchain?.displayName ?? token.blockchain})
                  </div>
                )}

                {(blockchain?.type === TransactionType.EVM && token.address) && (
                  <a
                    href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', token.address)}
                    target='_blank'
                    className={isActive(token) ? 'link-dark text-decoration-none' : 'text-decoration-none'}
                  >
                    {token.name} ({blockchain?.displayName ?? token.blockchain})
                  </a>
                )}
              </div>
            </div>
            {token.usdPrice === null && (
              <Alert variant='warning' className='p-2'>
                {t('components.tokens_modal.price_not_defined')}
              </Alert>
            )}
          </ListGroup.Item>
        )
      })
  }, [blockchains, pageNum, t, isActive, tokenSelectHandler])

  return (
    <Modal show={modalOpen} onHide={toggleModal} className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>{t('components.tokens_modal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <InputGroup className="p-3">
          <Form.Control placeholder={t('components.tokens_modal.search_placeholder')} onChange={e => setSearchQuery(e.target.value)} value={searchQuery} autoFocus={true} />
          <InputGroup.Text><Search /></InputGroup.Text>
        </InputGroup>

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

          {(!!results && results.length > 0) && getTokens(results)}
        </ListGroup>
      </Modal.Body>
    </Modal >
  )
}

export default ConversionTokensModal
