import { useEffect, useState, useRef, useCallback, useDeferredValue } from 'react'
import { Form, InputGroup, ListGroup, Modal, Spinner, Image, Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo, TransactionType } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useModalIsOpen, useToggleModal } from '../../../../states/application/hook'
import { ApplicationModal } from '../../../../types/application-modal'
import { isNullOrEmptyOrWhitespaces, sameToken, tokenDefaultResultComparator } from '../../../../libs/utils'
import { tokenExtSchema } from '../../../../types/orama'
import { PAGE_SIZE } from '../../../../constants'
import { TokenExt } from '../../../../types/token-ext'
import useTokensExtDb from '../../../../libs/hooks/useTokensExtDb'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'

interface PaymentTokensModalProps {
  selectedBlockchain: BlockchainMeta | undefined
  selectedToken: TokenExt | undefined
  tokens: TokenExt[] | undefined
  onUpdate: (token: TokenExt) => void
}

const PaymentTokensModal: React.FC<PaymentTokensModalProps> = (props) => {
  const { selectedBlockchain, selectedToken, tokens, onUpdate } = props

  const [results, setResults] = useState<TokenExt[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [pageNum, setPageNum] = useState(1)
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null)

  const { t } = useTranslation()

  const searchModalOpen = useModalIsOpen(ApplicationModal.TOKEN_PAYMENT)
  const toggleSearchModal = useToggleModal(ApplicationModal.TOKEN_PAYMENT)

  const tokensDb = useTokensExtDb(tokens)

  useEffect(() => {
    const searchTokens = async (tokensDb: Orama<typeof tokenExtSchema>, query: string) => {
      const result = await search(tokensDb, {
        term: query,
        properties: ['symbol', 'name', 'address'],
        boost: {
          symbol: 1.5
        }
      })

      const preparedResults = result.hits
        .sort((a, b) => {
          if (a.score < b.score) {
            return 1
          }

          if (a.score > b.score) {
            return -1
          }

          return tokenDefaultResultComparator(a.document, b.document)
        })
        .map(item => item.document)

      setResults(preparedResults)
    }

    if (tokensDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchTokens(tokensDb, deferredQuery)
    } else {
      setResults(tokens)
    }

    setPageNum(1)
  }, [tokens, tokensDb, deferredQuery])

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

  const tokenSelectHandler = useCallback((token: TokenExt) => {
    toggleSearchModal()
    onUpdate(token)
  }, [onUpdate, toggleSearchModal])

  const isActive = useCallback((token: TokenExt) => {
    return selectedToken && sameToken(token, selectedToken)
  }, [selectedToken])

  return (
    <Modal show={searchModalOpen} onHide={toggleSearchModal} className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>
          {t('components.payment.token_modal_title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={t('components.payment.token_modal_search_placeholder')}
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
            results
              .slice(0, pageNum * PAGE_SIZE)
              .map((token, i) => (
                <ListGroup.Item
                  action
                  key={[token.blockchain, token.symbol, token.address].join('_')}
                  disabled={token.usdPrice === null}
                  active={isActive(token)}
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

                      {(selectedBlockchain?.type !== TransactionType.EVM || !token.address) && (
                        <div className={isActive(token) ? '' : 'text-muted'}>
                          {token.name}
                        </div>
                      )}

                      {(selectedBlockchain?.type === TransactionType.EVM && token.address) && (
                        <a
                          href={(selectedBlockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', token.address)}
                          target='_blank'
                          className={isActive(token) ? 'link-dark text-decoration-none' : 'text-decoration-none'}
                        >
                          {token.name}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className='d-flex align-items-center'>
                    <small>
                      <TokenAmountWithCurrency
                        tokenSymbol={token.symbol}
                        tokenDecimals={token.decimals}
                        tokenAmount={token.balance}
                        currency={token.currency}
                        currencyAmount={token.balanceCurrency}
                        hideZeroBalance
                      />
                    </small>
                    {token.usdPrice === null && (
                      <Alert variant='warning' className='p-2'>
                        {t('components.tokens_modal.price_not_defined')}
                      </Alert>
                    )}
                  </div>
                </ListGroup.Item>
              ))
          )}
        </ListGroup>
      </Modal.Body>
    </Modal >
  )
}

export default PaymentTokensModal
