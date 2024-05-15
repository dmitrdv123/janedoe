import { useEffect, useState, useRef, useCallback, useMemo, useDeferredValue } from 'react'
import { Form, InputGroup, ListGroup, Modal, Image, Alert, Spinner } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, EVMChainInfo, Token, TransactionType, WalletDetail } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useModalIsOpen, useToggleModal } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'
import useTokenWithBalanceDb from '../../../libs/hooks/useTokenWithBalanceDb'
import { PAGE_SIZE } from '../../../constants'
import { isAsset, isNullOrEmptyOrWhitespaces, sameToken, tokenAmountToCurrency, tokenAmountToUsd, tokenResultComparator } from '../../../libs/utils'
import TokenAmountWithCurrency from '../../../components/TokenAmountWithCurrency'
import { useExchangeRate, usePaymentSettings } from '../../../states/settings/hook'
import usePaymentData from '../../../libs/hooks/usePaymentData'
import { tokenWithBalanceSchema } from '../../../types/orama'
import { TokenWithBalance } from '../../../types/token-with-balance'

interface TokensModalProps {
  blockchain: BlockchainMeta
  selectedToken: Token | undefined
  tokens: Token[]
  walletDetails: WalletDetail | undefined
  onUpdate: (token: Token) => void
}

const TokensModal: React.FC<TokensModalProps> = (props) => {
  const { blockchain, selectedToken, tokens, walletDetails, onUpdate } = props

  const [results, setResults] = useState<TokenWithBalance[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [withoutConversion, setWithoutConversion] = useState<boolean>(false)
  const [pageNum, setPageNum] = useState(1)
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null)

  const { t } = useTranslation()

  const modalOpen = useModalIsOpen(ApplicationModal.TOKEN)
  const toggleModal = useToggleModal(ApplicationModal.TOKEN)
  const paymentSettings = usePaymentSettings()
  const exchangeRate = useExchangeRate()
  const { currency } = usePaymentData()

  const preparedTokens: TokenWithBalance[] = useMemo(() => {
    return tokens
      .map(token => {
        const assetAndAmount = walletDetails?.balances?.find(
          item => isAsset(item.asset, token.blockchain, token.symbol, token.address)
        )

        const balance = assetAndAmount ? assetAndAmount.amount.amount : null
        const balanceUsd = balance && token.usdPrice ? tokenAmountToUsd(balance, token.usdPrice, token.decimals) : null
        const balanceCurrency = balance && token.usdPrice && exchangeRate
          ? tokenAmountToCurrency(balance, token.usdPrice, token.decimals, exchangeRate)
          : null

        return {
          ...token,
          currency,
          balance,
          balanceUsd,
          balanceCurrency
        }
      })
      .sort((a, b) => tokenResultComparator(a, b))
  }, [currency, exchangeRate, tokens, walletDetails])

  const tokensDb = useTokenWithBalanceDb(preparedTokens)

  useEffect(() => {
    const searchTokens = async (tokensDb: Orama<typeof tokenWithBalanceSchema>, query: string) => {
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

          return tokenResultComparator(a.document, b.document)
        })
        .filter(item => {
          if (withoutConversion) {
            return paymentSettings?.assets.find(
              asset => isAsset(asset, item.document.blockchain, item.document.symbol, item.document.address ? item.document.address : null)
            )
          }

          return true
        })
        .map(item => item.document)

      setResults(preparedResults)
    }

    if (tokensDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchTokens(tokensDb, deferredQuery)
    } else {
      const preparedResults = withoutConversion
        ? preparedTokens.filter(item => paymentSettings?.assets.find(
          asset => isAsset(asset, item.blockchain, item.symbol, item.address)
        ))
        : preparedTokens

      setResults(preparedResults)
    }

    setPageNum(1)
  }, [preparedTokens, tokensDb, deferredQuery, paymentSettings?.assets, withoutConversion])

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

  return (
    <Modal show={modalOpen} onHide={toggleModal} size="lg" className="modal-list">
      <Modal.Header closeButton>
        <Modal.Title>{t('components.tokens_modal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={t('components.tokens_modal.search_placeholder')}
              onChange={e => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoFocus={true}
            />
            <InputGroup.Text><Search /></InputGroup.Text>
          </InputGroup>

          <Form.Group>
            <Form.Check type='checkbox' label={t('components.tokens_modal.conversion_checkbox')} checked={withoutConversion} onChange={e => setWithoutConversion(e.target.checked)} />
            <Form.Text className="text-muted">
              {t('components.tokens_modal.conversion_checkbox_desc')}
            </Form.Text>
          </Form.Group>
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
            results
              .slice(0, pageNum * PAGE_SIZE)
              .map((token, i) => (
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
                          {token.name}
                        </div>
                      )}

                      {(blockchain?.type === TransactionType.EVM && token.address) && (
                        <a
                          href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', token.address)}
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

export default TokensModal
