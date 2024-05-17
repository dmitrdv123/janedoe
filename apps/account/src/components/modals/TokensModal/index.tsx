import { useEffect, useMemo, useState, useRef, useCallback, useDeferredValue } from 'react'
import { Form, InputGroup, ListGroup, Modal, Spinner, Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo, Token, TransactionType } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useModalIsOpen, useToggleModal } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'
import { useTokens } from '../../../states/meta/hook'
import { isNullOrEmptyOrWhitespaces, sameTokenAndAsset, tokenDefaultResultComparator } from '../../../libs/utils'
import useTokensDb from '../../../libs/hooks/useTokensDb'
import { AccountPaymentSettings } from '../../../types/account-settings'
import { tokenSchema } from '../../../types/orama'
import { PAGE_SIZE } from '../../../constants'

interface TokensModalProps {
  accountPaymentSettings: AccountPaymentSettings
  blockchain: BlockchainMeta | undefined
  onUpdateAccountPaymentSettings: (accountPaymentSettings: AccountPaymentSettings) => void
}

const TokensModal: React.FC<TokensModalProps> = (props) => {
  const { accountPaymentSettings, blockchain, onUpdateAccountPaymentSettings } = props

  const [results, setResults] = useState<Token[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [pageNum, setPageNum] = useState(1)
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null)

  const { t } = useTranslation()

  const searchModalOpen = useModalIsOpen(ApplicationModal.TOKEN)
  const toggleSearchModal = useToggleModal(ApplicationModal.TOKEN)
  const tokens = useTokens()

  const preparedTokens = useMemo(() => {
    return tokens
      ?.filter(token =>
        blockchain?.name.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
        && accountPaymentSettings.assets.findIndex(asset => sameTokenAndAsset(asset, token)) === -1
      )
      .sort(tokenDefaultResultComparator)
  }, [blockchain, accountPaymentSettings, tokens])

  const tokensDb = useTokensDb(preparedTokens)

  useEffect(() => {
    const searchTokens = async (tokensDb: Orama<typeof tokenSchema>, query: string) => {
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
      setResults(preparedTokens)
    }

    setPageNum(1)
  }, [preparedTokens, tokensDb, deferredQuery])

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
    const isExist = accountPaymentSettings.assets.findIndex(item => sameTokenAndAsset(item, token)) !== -1

    if (isExist) {
      onUpdateAccountPaymentSettings({
        ...accountPaymentSettings,
        blockchains: accountPaymentSettings.blockchains,
        assets: accountPaymentSettings.assets.filter(item => !sameTokenAndAsset(item, token))
      })
    } else {
      const asset = {
        blockchain: token.blockchain,
        symbol: token.symbol,
        address: isNullOrEmptyOrWhitespaces(token.address) ? null : token.address
      }

      onUpdateAccountPaymentSettings({
        ...accountPaymentSettings,
        blockchains: accountPaymentSettings.blockchains,
        assets: [...accountPaymentSettings.assets, asset]
      })
    }
  }, [accountPaymentSettings, onUpdateAccountPaymentSettings])

  return (
    <Modal show={searchModalOpen} onHide={toggleSearchModal} className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>
          {t('components.payment_settings.token_modal_title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={t('components.payment_settings.token_modal_search_placeholder')}
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
                        <div className='text-muted'>
                          {token.name}
                        </div>
                      )}

                      {(blockchain?.type === TransactionType.EVM && token.address) && (
                        <a
                          href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', token.address)}
                          target='_blank'
                          className='text-decoration-none'
                        >
                          {token.name}
                        </a>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
          )}
        </ListGroup>
      </Modal.Body>
    </Modal >
  )
}

export default TokensModal
