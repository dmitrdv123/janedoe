import React, { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Button, Card, Dropdown, Form, InputGroup, Spinner } from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import isEqual from 'lodash.isequal'
import { Orama, search } from '@orama/orama'

import { useAccountCommonSettings, useAccountRbacSettings, useUpdateAccountCommonSettingsCallback } from '../../../../states/account-settings/hook'
import { AccountCommonSettings } from '../../../../types/account-settings'
import { useInfoMessages } from '../../../../states/application/hook'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { COMMON_SETTINGS_MAX_DESCRIPTION_LENGTH, CURRENCY_USD_SYMBOL, INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_ERROR, INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_SAVING_ERROR } from '../../../../constants'
import { assertAccountCommonSettings, isNullOrEmptyOrWhitespaces, stringComparator } from '../../../../libs/utils'
import { useSettings } from '../../../../states/settings/hook'
import { AppSettingsCurrency } from '../../../../types/app-settings'
import useCurrenciesDb from '../../../../libs/hooks/useCurrenciesDb'
import { currencySchema } from '../../../../types/orama'
import RbacGuard from '../../../Guards/RbacGuard'

const CommonSettings: React.FC = () => {
  const [emailCommonSettings, setEmailCommonSettings] = useState<string>('')
  const [descCommonSettings, setDescCommonSettings] = useState<string>('')
  const [currencyCommonSettings, setCurrencyCommonSettings] = useState<AppSettingsCurrency | undefined>(undefined)
  const [commonSettingsValidated, setCommonSettingsValidated] = useState(true)
  const [isCommonSettingsSaveEnabled, setIsCommonSettingsSaveEnabled] = useState(false)

  const [results, setResults] = useState<AppSettingsCurrency[] | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredQuery = useDeferredValue(searchQuery)

  const { t } = useTranslation()
  const appSettings = useSettings()
  const commonSettings = useAccountCommonSettings()
  const rbacSettings = useAccountRbacSettings()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const { status: saveCommonSettingsStatus, process: saveCommonSettings } = useApiRequest<AccountCommonSettings>()
  const updateCommonSettings = useUpdateAccountCommonSettingsCallback()

  const preparedCurrencies = useMemo(() => {
    return appSettings.current
      ? [...appSettings.current.currencies].sort((a, b) => stringComparator(a.symbol, b.symbol))
      : undefined
  }, [appSettings])

  const currenciesDb = useCurrenciesDb(preparedCurrencies)

  useEffect(() => {
    setEmailCommonSettings(commonSettings?.email ?? '')
    setDescCommonSettings(commonSettings?.description ?? '')
    setCurrencyCommonSettings(value => {
      const currency = !commonSettings ? undefined : commonSettings.currency ?? CURRENCY_USD_SYMBOL
      return currency
        ? appSettings.current?.currencies.find(
          item => item.symbol.toLocaleLowerCase() === currency?.toLocaleLowerCase()
        )
        : value
    })
  }, [appSettings, commonSettings])

  useEffect(() => {
    const currentCommonSettings: AccountCommonSettings = {
      email: emailCommonSettings,
      description: descCommonSettings,
      currency: currencyCommonSettings?.symbol ?? null
    }
    const isEnable = !isEqual(commonSettings, currentCommonSettings) && assertAccountCommonSettings(currentCommonSettings).length === 0
    setIsCommonSettingsSaveEnabled(isEnable)
  }, [emailCommonSettings, descCommonSettings, commonSettings, currencyCommonSettings])

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
      setResults(preparedCurrencies)
    }
  }, [currenciesDb, deferredQuery, preparedCurrencies])

  const validateAccountCommonSettings = useCallback((settings: AccountCommonSettings): boolean => {
    const errors = assertAccountCommonSettings(settings)

    if (errors.length === 0) {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_ERROR)
    } else {
      addInfoMessage(errors.join('. '), INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_ERROR, 'danger')
    }

    return errors.length === 0
  }, [addInfoMessage, removeInfoMessage])

  const saveCommonSettingsHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const settingsToSave: AccountCommonSettings = {
      email: emailCommonSettings,
      description: descCommonSettings,
      currency: currencyCommonSettings?.symbol ?? null
    }

    const form = event.currentTarget
    if (!form.checkValidity() || !validateAccountCommonSettings(settingsToSave)) {
      event.stopPropagation()
    } else {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_SAVING_ERROR)
      try {
        await saveCommonSettings(ApiWrapper.instance.saveAccountCommonSettingsRequest(settingsToSave))
        updateCommonSettings(settingsToSave)
      } catch (error) {
        addInfoMessage(
          t('components.account_settings.errors.fail_save_common_settings'),
          INFO_MESSAGE_ACCOUNT_COMMON_SETTINGS_SAVING_ERROR,
          'danger',
          error
        )
      }
    }

    setCommonSettingsValidated(true)
  }, [t, currencyCommonSettings?.symbol, descCommonSettings, emailCommonSettings, addInfoMessage, removeInfoMessage, saveCommonSettings, updateCommonSettings, validateAccountCommonSettings])

  return (
    <Card className='mb-3'>
      <Card.Body>
        <Card.Title>
          {t('components.account_settings.common_settings_title')}
        </Card.Title>
        <Form noValidate validated={commonSettingsValidated} onSubmit={saveCommonSettingsHandler} onBlur={(event) => event.currentTarget.checkValidity()}>
          <Form.Group className="mb-3">
            <Form.Label>{t('components.account_settings.common_settings_email')}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t('components.account_settings.common_settings_email_placeholder')}
              value={emailCommonSettings}
              onChange={event => setEmailCommonSettings(event.target.value)}
              readOnly={!rbacSettings?.isOwner && rbacSettings?.permissions['common_settings'] !== 'Modify'}
            />
            <Form.Control.Feedback type="invalid">
              {t('components.account_settings.common_settings_email_invalid')}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {t('components.account_settings.common_settings_email_desc')}
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('components.account_settings.common_settings_company')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descCommonSettings}
              onChange={event => setDescCommonSettings(event.target.value)}
              readOnly={!rbacSettings?.isOwner && rbacSettings?.permissions['common_settings'] !== 'Modify'}
              maxLength={COMMON_SETTINGS_MAX_DESCRIPTION_LENGTH}
            />
            <Form.Text className="text-muted">
              {t('components.account_settings.common_settings_company_desc')}
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('components.account_settings.common_settings_currency')}</Form.Label>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                className='w-100'
                disabled={!rbacSettings?.isOwner && rbacSettings?.permissions['common_settings'] !== 'Modify'}
              >
                {currencyCommonSettings?.symbol ?? t('components.account_settings.common_settings_select_currency')} {!!currencyCommonSettings && (<>({currencyCommonSettings?.country})</>)}
              </Dropdown.Toggle>
              <Dropdown.Menu className='w-100 overflow-scroll dropdown-currency'>
                <Dropdown.ItemText>
                  <InputGroup>
                    <Form.Control
                      autoFocus
                      placeholder={t('components.account_settings.common_settings_search_currency_placeholder')}
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
                    <Dropdown.Item onClick={() => setCurrencyCommonSettings(currency)} active={isEqual(currency, currencyCommonSettings)} key={currency.symbol}>
                      {currency.symbol}
                      <div className='text-muted'>{currency.desc} ({currency.country})</div>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Form.Text className="text-muted">
              {t('components.account_settings.common_settings_currency_desc')}
            </Form.Text>
          </Form.Group>

          <RbacGuard requiredKeys={['common_settings']} requiredPermission='Modify' element={

            <Button variant="primary" type="submit" disabled={saveCommonSettingsStatus === 'processing' || !isCommonSettingsSaveEnabled}>
              {t('common.save_btn')}
              {(saveCommonSettingsStatus === 'processing') && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                  <span className="visually-hidden">{t('common.saving')}</span>
                </Spinner>
              )}
            </Button>

          } />
        </Form>
      </Card.Body>
    </Card>
  )
}

export default CommonSettings
