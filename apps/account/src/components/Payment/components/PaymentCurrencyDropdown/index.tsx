import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Dropdown, Form, InputGroup, Spinner } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { Orama, search } from '@orama/orama'
import isEqual from 'lodash.isequal'

import { AppSettingsCurrency } from '../../../../types/app-settings'
import useCurrenciesDb from '../../../../libs/hooks/useCurrenciesDb'
import { currencySchema } from '../../../../types/orama'
import { isNullOrEmptyOrWhitespaces, stringComparator } from '../../../../libs/utils'
import { useSettings } from '../../../../states/settings/hook'
import { useAccountCommonSettings } from '../../../../states/account-settings/hook'

interface PaymentCurrencyDropdownProps {
  onUpdate: (currency: AppSettingsCurrency | undefined) => void
}

const PaymentCurrencyDropdown: React.FC<PaymentCurrencyDropdownProps> = (props) => {
  const { onUpdate } = props

  const [selectedCurrency, setSelectedCurrency] = useState<AppSettingsCurrency | undefined>(undefined)
  const [results, setResults] = useState<AppSettingsCurrency[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { t } = useTranslation()
  const location = useLocation()
  const appSettings = useSettings()
  const commonSettings = useAccountCommonSettings()
  const deferredQuery = useDeferredValue(searchQuery)

  const currencies = useMemo(() => {
    return appSettings.current
      ? [...appSettings.current.currencies].sort((a, b) => stringComparator(a.symbol, b.symbol))
      : undefined
  }, [appSettings])

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

  useEffect(() => {
    setSelectedCurrency(current => {
      if (!commonSettings || !currencies) {
        return undefined
      }

      if (current) {
        return current
      }

      const currencyFromParam = new URLSearchParams(location.search).get('currency')
      if (currencyFromParam) {
        const currency = currencies.find(item => item.symbol.toLocaleLowerCase() === currencyFromParam.toLocaleLowerCase())
        if (currency) {
          return currency
        }
      }

      const currency = currencies.find(item => item.symbol.toLocaleLowerCase() === commonSettings.currency?.toLocaleLowerCase())
      if (currency) {
        return currency
      }

      return currencies.length > 0 ? currencies[0] : undefined
    })
  }, [commonSettings, currencies, location.search])

  useEffect(() => {
    onUpdate(selectedCurrency)
  }, [selectedCurrency, onUpdate])

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
              <Dropdown.Item onClick={() => setSelectedCurrency(currency)} active={isEqual(currency, selectedCurrency)} key={currency.symbol}>
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
