import { BlockchainMeta } from 'rango-sdk-basic'
import { Alert, Col, Form, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useInfoMessages } from '../../states/application/hook'
import { useCallback, useEffect, useMemo, useState } from 'react'

import PaymentBlockchainButton from './components/PaymentBlockchainButton'
import { useBlockchains, useTokens } from '../../states/meta/hook'
import { useSettings } from '../../states/settings/hook'
import { currencyToTokenAmount, formatToFixed, isBlockchainAsset, parseToBigNumber, sameToken, sameTokenAndAsset, stringComparator, tokenAmountToCurrency, tokenAmountToUsd, tokenExtResultComparator, tryParseFloat } from '../../libs/utils'
import { useAccountCommonSettings, useAccountPaymentSettings } from '../../states/account-settings/hook'
import { AppSettingsCurrency } from '../../types/app-settings'
import PaymentCurrencyDropdown from './components/PaymentCurrencyDropdown'
import useSpecificExchangeRate from '../../libs/hooks/useSpecificExchangeRate'
import TransactionHash from '../TransactionHash'
import { WithdrawResult } from '../../types/withdraw_result'
import { TokenExt } from '../../types/token-ext'
import useReadBalances from '../../libs/hooks/useReadBalances'
import PaymentTokenButton from './components/PaymentTokenButton'
import PaymentPayButton from './components/PaymentPayButton'

const Payment: React.FC = () => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainMeta | undefined>(undefined)
  const [selectedToken, setSelectedToken] = useState<TokenExt | undefined>(undefined)
  const [selectedCurrency, setSelectedCurrency] = useState<AppSettingsCurrency | undefined>(undefined)
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined)
  const [selectedCurrencyAmount, setSelectedCurrencyAmount] = useState<string | undefined>(undefined)
  const [selectedTokenAmountFormatted, setSelectedTokenAmountFormatted] = useState<string | undefined>(undefined)
  const [payResults, setPayResults] = useState<{ [key: string]: WithdrawResult }>({})

  const { t } = useTranslation()
  const { clearInfoMessage } = useInfoMessages()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const appSettings = useSettings()
  const commonSettings = useAccountCommonSettings()
  const accountPaymentSettings = useAccountPaymentSettings()
  const exchangeRate = useSpecificExchangeRate(selectedCurrency?.symbol)

  const {
    tokens: tokensWithBalance
  } = useReadBalances(selectedBlockchain)

  const preparedBlockchains = useMemo(() => {
    if (!blockchains) {
      return undefined
    }

    return appSettings.current?.paymentBlockchains
      .map(
        item => blockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase())
      )
      .filter(item => !!item)
      .sort((a, b) => stringComparator((a as BlockchainMeta).displayName, (b as BlockchainMeta).displayName)) as BlockchainMeta[]
  }, [blockchains, appSettings])

  const preparedTokens = useMemo(() => {
    if (!selectedBlockchain || !accountPaymentSettings || !tokensWithBalance) {
      return undefined
    }

    return tokens
      ?.filter(
        token => selectedBlockchain.name.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
      )
      .map(token => {
        const tokenWithBalance = tokensWithBalance.find(item => sameToken(item, token))

        const tokenBalanceUsd = tokenWithBalance && token.usdPrice ? tokenAmountToUsd(tokenWithBalance.balance.toString(), token.usdPrice, token.decimals) : null
        const tokenBalanceCurrency = tokenWithBalance && token.usdPrice && exchangeRate.data
          ? tokenAmountToCurrency(tokenWithBalance.balance.toString(), token.usdPrice, token.decimals, exchangeRate.data)
          : null

        const result: TokenExt = {
          ...token,
          settingIndex: accountPaymentSettings.assets.findIndex(asset => sameTokenAndAsset(asset, token)),
          currency: selectedCurrency?.symbol ?? null,
          balance: tokenWithBalance?.balance.toString() ?? null,
          balanceUsd: tokenBalanceUsd,
          balanceCurrency: tokenBalanceCurrency
        }

        return result
      })
      .sort(tokenExtResultComparator)
  }, [selectedBlockchain, accountPaymentSettings, tokens, tokensWithBalance, exchangeRate.data, selectedCurrency?.symbol])

  const preparedCurrencies = useMemo(() => {
    return appSettings.current
      ? [...appSettings.current.currencies].sort((a, b) => stringComparator(a.symbol, b.symbol))
      : undefined
  }, [appSettings])

  const selectedTokenAmount = useMemo(() => {
    if (!selectedToken || !selectedTokenAmountFormatted) {
      return undefined
    }

    const amountNum = tryParseFloat(selectedTokenAmountFormatted)
    if (!amountNum) {
      return undefined
    }

    return parseToBigNumber(amountNum, selectedToken.decimals).toString()
  }, [selectedToken, selectedTokenAmountFormatted])

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta | undefined) => {
    clearInfoMessage()
    setSelectedBlockchain(blockchainToUpdate)
    setSelectedToken(undefined)
  }, [clearInfoMessage])

  const selectTokenHandler = useCallback((tokenToUpdate: TokenExt | undefined) => {
    clearInfoMessage()
    setSelectedToken(tokenToUpdate)
  }, [clearInfoMessage])

  const selectCurrencyHandler = useCallback((currencyToUpdate: AppSettingsCurrency | undefined) => {
    setSelectedCurrency(currencyToUpdate)
  }, [])

  const setCurrencyAmountHandler = useCallback((currencyAmountToUpdate: string) => {
    const currencyAmountNumToUpdate = tryParseFloat(currencyAmountToUpdate)
    if (currencyAmountNumToUpdate === undefined) {
      setSelectedCurrencyAmount('')
      setSelectedTokenAmountFormatted('')
      return
    }

    let tokenAmountToUpdate = ''
    if (selectedToken?.usdPrice && exchangeRate.data) {
      const tokenAmountParsedToUpdate = currencyToTokenAmount(currencyAmountNumToUpdate, selectedToken?.usdPrice, selectedToken?.decimals, exchangeRate.data)
      tokenAmountToUpdate = formatToFixed(tokenAmountParsedToUpdate, selectedToken.decimals)
    }

    setSelectedTokenAmountFormatted(tokenAmountToUpdate)
    setSelectedCurrencyAmount(currencyAmountToUpdate)
  }, [exchangeRate, selectedToken?.decimals, selectedToken?.usdPrice])

  const setTokenAmountHandler = useCallback((tokenAmountToUpdate: string) => {
    const tokenAmountNumToUpdate = tryParseFloat(tokenAmountToUpdate)
    if (tokenAmountNumToUpdate === undefined) {
      setSelectedCurrencyAmount('')
      setSelectedTokenAmountFormatted('')
      return
    }

    let currencyAmountToUpdate = ''
    if (selectedToken?.usdPrice && exchangeRate.data) {
      const tokenAmountParsedToUpdate = parseToBigNumber(tokenAmountNumToUpdate, selectedToken?.decimals).toString()
      currencyAmountToUpdate = tokenAmountToCurrency(tokenAmountParsedToUpdate, selectedToken.usdPrice, selectedToken.decimals, exchangeRate.data).toString()
    }

    setSelectedTokenAmountFormatted(tokenAmountToUpdate)
    setSelectedCurrencyAmount(currencyAmountToUpdate)
  }, [exchangeRate, selectedToken?.decimals, selectedToken?.usdPrice])

  const successHandler = useCallback((blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => {
    setPayResults(val => {
      if (val[blockchain.name] && val[blockchain.name].hash === hash) {
        return val
      }

      const res = { ...val }
      res[blockchain.name] = { blockchain, hash, message }
      return res
    })
  }, [])

  const removePayResultHandler = (blockchain: string) => {
    setPayResults(val => {
      const res = { ...val }
      delete res[blockchain]
      return res
    })
  }

  useEffect(() => {
    setSelectedBlockchain(current => {
      if (!current && preparedBlockchains && preparedBlockchains.length > 0) {
        return preparedBlockchains[0]
      }

      return current
    })
  }, [preparedBlockchains])

  useEffect(() => {
    setSelectedToken(current => {
      if (!current && selectedBlockchain) {
        const asset = accountPaymentSettings?.assets.find(asset => isBlockchainAsset(selectedBlockchain, asset))
        if (asset) {
          return preparedTokens?.find(token => sameTokenAndAsset(asset, token))
        }
      }

      return current
    })
  }, [accountPaymentSettings?.assets, preparedTokens, selectedBlockchain])

  useEffect(() => {
    setSelectedCurrency(current => {
      if (!current && commonSettings) {
        const currency = preparedCurrencies?.find(item => item.symbol.toLocaleLowerCase() === commonSettings.currency?.toLocaleLowerCase())
        if (currency) {
          return currency
        }
      }

      return current
    })
  }, [commonSettings, preparedCurrencies])

  useEffect(() => {
    const currencyAmountNum = tryParseFloat(selectedCurrencyAmount)
    if (selectedToken?.usdPrice && currencyAmountNum && exchangeRate.data) {
      const tokenAmount = currencyToTokenAmount(currencyAmountNum, selectedToken.usdPrice, selectedToken.decimals, exchangeRate.data)
      const tokenAmountFormatted = formatToFixed(tokenAmount, selectedToken.decimals)
      setSelectedTokenAmountFormatted(tokenAmountFormatted)
    } else {
      setSelectedTokenAmountFormatted('')
    }
  }, [exchangeRate.data, selectedCurrencyAmount, selectedToken?.decimals, selectedToken?.usdPrice])

  return (
    <>
      <h3 className="mb-3">{t('components.payment.title')}</h3>

      {Object.values(payResults).map(result => (
        <Alert
          key={result.blockchain.name}
          variant='success'
          dismissible
          onClose={() => removePayResultHandler(result.blockchain.name)}
        >
          {t('components.payment.pay_success', { blockchain: result.blockchain.displayName })} {result.hash && (<TransactionHash blockchain={result.blockchain} transactionHash={result.hash} />)}
          {!!result.message && (
            <div>{result.message}</div>
          )}
        </Alert>
      ))}

      <Form>
        {!!preparedBlockchains && (
          <div className="mb-2">
            <PaymentBlockchainButton selectedBlockchain={selectedBlockchain} blockchains={preparedBlockchains} onUpdate={selectBlockchainHandler} />
          </div>
        )}

        {(!!selectedBlockchain && !!preparedTokens && preparedTokens.length > 1) && (
          <div className="mb-2">
            <PaymentTokenButton selectedBlockchain={selectedBlockchain} selectedToken={selectedToken} selectedCurrency={selectedCurrency} selectedTokenAmount={selectedTokenAmount} tokens={preparedTokens} onUpdate={selectTokenHandler} />
          </div>
        )}

        <Row>
          <Col>
            {(!!preparedCurrencies) && (
              <div className="mb-2">
                <PaymentCurrencyDropdown selectedCurrency={selectedCurrency} currencies={preparedCurrencies} onUpdate={selectCurrencyHandler} />
              </div>
            )}

            <div className="mb-2">
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder={t('components.payment.currency_amount')}
                  value={selectedCurrencyAmount ?? ''}
                  onChange={e => setCurrencyAmountHandler(e.target.value)}
                />
                {!tryParseFloat(selectedCurrencyAmount) && (
                  <Form.Text className="text-danger">
                    {t('components.payment.errors.currency_amount_required')}
                  </Form.Text>
                )}
              </Form.Group>
            </div>
          </Col>
          <Col>
            <div className="mb-2">
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder={t('components.payment.token_amount')}
                  value={selectedTokenAmountFormatted ?? ''}
                  onChange={e => setTokenAmountHandler(e.target.value)}
                />
                {!tryParseFloat(selectedTokenAmountFormatted) && (
                  <Form.Text className="text-danger">
                    {t('components.payment.errors.token_amount_required')}
                  </Form.Text>
                )}
              </Form.Group>
            </div>
          </Col>
        </Row>

        <div className='mb-2'>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder={t('components.payment.address')}
              value={selectedAddress ?? ''}
              onChange={e => setSelectedAddress(e.target.value)}
            />
            {!selectedAddress && (
              <Form.Text className="text-danger">
                {t('components.payment.errors.address_required')}
              </Form.Text>
            )}
          </Form.Group>
        </div>

        <div className='mb-2'>
          <PaymentPayButton
            selectedBlockchain={selectedBlockchain}
            selectedToken={selectedToken}
            selectedAddress={selectedAddress}
            selectedTokenAmount={selectedTokenAmount}
            onSuccess={successHandler}
          />
        </div>
      </Form >
    </>
  )
}

export default Payment
