import { Dropdown, Form, InputGroup, Spinner } from 'react-bootstrap'
import { useDeferredValue, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AppSettingsCurrency } from '../../../../types/app-settings'
import isEqual from 'lodash.isequal'
import { Search } from 'react-bootstrap-icons'
import useCurrenciesDb from '../../../../libs/hooks/useCurrenciesDb'
import { currencySchema } from '../../../../types/orama'
import { Orama, search } from '@orama/orama'
import { isNullOrEmptyOrWhitespaces, stringComparator } from '../../../../libs/utils'

interface PaymentCurrencyDropdownProps {
  selectedCurrency: AppSettingsCurrency | undefined
  currencies: AppSettingsCurrency[]
  onUpdate: (currency: AppSettingsCurrency | undefined) => void
}

const PaymentCurrencyDropdown: React.FC<PaymentCurrencyDropdownProps> = (props) => {
  const { selectedCurrency, currencies, onUpdate } = props

  const { t } = useTranslation()
  const [results, setResults] = useState<AppSettingsCurrency[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)
  const currenciesDb = useCurrenciesDb(currencies)

  useEffect(() => {
    const searchCurrencies = async (tokensDb: Orama<typeof currencySchema>, query: string) => {
      const result = await search(tokensDb, {
        term: query,
        properties: ['symbol', 'desc', 'country'],
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

          return stringComparator(a.document.symbol, b.document.symbol)
        })
        .map(item => item.document)

      setResults(preparedResults)
    }

    if (currenciesDb && !isNullOrEmptyOrWhitespaces(deferredQuery)) {
      searchCurrencies(currenciesDb, deferredQuery)
    } else {
      setResults(currencies)
    }
  }, [currenciesDb, deferredQuery, currencies])

  return (
    <Form.Group>
      <Dropdown>
        <Dropdown.Toggle variant="outline-secondary" className='w-100' >
          {selectedCurrency?.symbol ?? t('components.payment.select_currency')} {!!selectedCurrency && (<>({selectedCurrency?.country})</>)}
        </Dropdown.Toggle>
        <Dropdown.Menu className='w-100 overflow-scroll dropdown-currency'>
          <Dropdown.ItemText>
            <InputGroup>
              <Form.Control
                autoFocus
                placeholder={t('components.payment.search_currency_placeholder')}
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              <InputGroup.Text><Search /></InputGroup.Text>
            </InputGroup>
          </Dropdown.ItemText>

          {!results && (
            <Dropdown.ItemText>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                <span className="visually-hidden">{t('common.loading')}</span>
              </Spinner>
            </Dropdown.ItemText>
          )}

          {(results && results.length === 0) && (
            <Dropdown.ItemText>
              {t('common.nothing_found')}
            </Dropdown.ItemText>
          )}

          {(results && results.length > 0) && (
            results.map(currency => (
              <Dropdown.Item onClick={() => onUpdate(currency)} active={isEqual(currency, selectedCurrency)} key={currency.symbol}>
                {currency.symbol}
                <div className='text-muted'>{currency.desc} ({currency.country})</div>
              </Dropdown.Item>
            ))
          )}
        </Dropdown.Menu>
      </Dropdown>
      {!selectedCurrency && (
        <Form.Text className="text-danger">
          {t('components.payment.errors.currency_required')}
        </Form.Text>
      )}
    </Form.Group>
  )
}

export default PaymentCurrencyDropdown
