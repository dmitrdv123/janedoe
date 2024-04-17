import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Col, Form, InputGroup, ListGroup, Row, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-bootstrap-icons'
import { Token } from 'rango-sdk-basic'
import { Orama, search } from '@orama/orama'

import { useBlockchains, useTokens } from '../../../../states/meta/hook'
import { useSettings } from '../../../../states/settings/hook'
import TokenDetails from './components/TokenDetails'
import { findBlockchainByName, isNullOrEmptyOrWhitespaces, stringComparator, tokenDefaultResultComparator } from '../../../../libs/utils'
import useTokensDb from '../../../../libs/hooks/useTokensDb'
import { PAGE_SIZE } from '../../../../constants'
import { tokenSchema } from '../../../../types/orama'

const Tokens: React.FC = () => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('')

  const [results, setResults] = useState<Token[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [pageNum, setPageNum] = useState(1)
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null)

  const { t } = useTranslation()

  const blockchains = useBlockchains()
  const tokens = useTokens()
  const settings = useSettings()

  const preparedTokens = useMemo(() => {
    if (!tokens || !settings.current) {
      return undefined
    }

    return tokens
      .filter(
        token => {
          if (selectedBlockchain) {
            return token.blockchain.toLocaleLowerCase() === selectedBlockchain.toLocaleLowerCase()
          }

          return settings.current?.paymentBlockchains.findIndex(
            item => item.blockchain.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
          ) !== -1
        }
      )
      .sort((a, b) => tokenDefaultResultComparator(a, b))
  }, [settings, tokens, selectedBlockchain])

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

  return (
    <>
      <h1 className="mb-3">
        {t('components.resources.resources_tokens_title')}
      </h1>

      <Form>
        <Row>
          <Col md={4}>
            <InputGroup className="mb-2">
              <Form.Control
                placeholder={t('components.resources.resources_tokens_search_placeholder')}
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
                autoFocus={true}
              />
              <InputGroup.Text><Search /></InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select onChange={event => setSelectedBlockchain(event.target.value)} className="mb-2">
              <option value=''>{t('components.resources.resources_tokens_blockchain_select')}</option>
              {(!!blockchains && !!settings.current) && (
                settings.current.paymentBlockchains
                  .map(item => findBlockchainByName(blockchains, item.blockchain))
                  .sort((a, b) => a && b ? stringComparator(a.displayName, b.displayName) : -1)
                  .map(item => !!item && (
                    <option key={item?.name} value={item?.name}>
                      {item?.displayName}
                    </option>
                  ))
              )}
            </Form.Select>
          </Col>
          <Col md={4}>
            {!results && (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                <span className="visually-hidden">{t('common.processing')}</span>
              </Spinner>
            )}

            {!!results && (
              <Form.Control plaintext readOnly value={t('components.resources.resources_tokens_found', { count: results.length })} className="mb-2" />
            )}
          </Col>
        </Row>

      </Form>

      <hr />

      <ListGroup className="overflow-auto rounded-0">
        {(!blockchains || !results) && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.processing')}</span>
          </Spinner>
        )}

        {(!!blockchains && !!results && results.length === 0) && (
          <ListGroup.Item className="d-flex justify-content-between align-items-start border-0">
            <div className='d-flex align-items-center'>
              {t('common.nothing_found')}
            </div>
          </ListGroup.Item>
        )}

        {(!!blockchains && !!results && results.length > 0) && (
          results
            .slice(0, pageNum * PAGE_SIZE)
            .map((token, i) => (
              <ListGroup.Item key={[token.blockchain, token.symbol, token.address].join('_')} className="d-flex justify-content-between align-items-start border-0">
                <div ref={i === pageNum * PAGE_SIZE - 1 ? setLastElement : undefined}>
                  <TokenDetails blockchain={findBlockchainByName(blockchains, token.blockchain)} token={token} />
                </div>
              </ListGroup.Item>
            ))
        )}
      </ListGroup>
    </>
  )
}

export default Tokens
