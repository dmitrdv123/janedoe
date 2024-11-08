import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { Alert, Col, Form, Row } from 'react-bootstrap'

import { useInfoMessages } from '../../states/application/hook'
import PaymentBlockchainButton from './components/PaymentBlockchainButton'
import { currencyToTokenAmount, formatToFixed, parseToBigNumber, tokenAmountToCurrency, tryParseFloat } from '../../libs/utils'
import { AppSettingsCurrency } from '../../types/app-settings'
import PaymentCurrencyDropdown from './components/PaymentCurrencyDropdown'
import useSpecificExchangeRate from '../../libs/hooks/useSpecificExchangeRate'
import { WithdrawResult } from '../../types/withdraw_result'
import PaymentTokenButton from './components/PaymentTokenButton'
import PaymentPayButton from './components/PaymentPayButton'
import TransactionHash from '../TransactionHash'
import { INFO_MESSAGE_ACCOUNT_PAYMENT_SUCCESS_ERROR, PAYMENT_MAX_COMMENT_LENGTH } from '../../constants'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../libs/services/api-wrapper'

const Payment: React.FC = () => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainMeta | undefined>(undefined)
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined)
  const [selectedCurrency, setSelectedCurrency] = useState<AppSettingsCurrency | undefined>(undefined)
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined)
  const [selectedCurrencyAmount, setSelectedCurrencyAmount] = useState<string | undefined>(undefined)
  const [selectedTokenAmountFormatted, setSelectedTokenAmountFormatted] = useState<string | undefined>(undefined)
  const [selectedComment, setSelectedComment] = useState<string | undefined>(undefined)
  const [payResults, setPayResults] = useState<{ [key: string]: WithdrawResult }>({})
  const [isValid, setIsValid] = useState<boolean>(false)

  const { t, i18n } = useTranslation()
  const { clearInfoMessage } = useInfoMessages()
  const exchangeRate = useSpecificExchangeRate(selectedCurrency?.symbol)
  const location = useLocation()
  const { process: successPayment } = useApiRequest()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const selectedTokenAmount = useMemo(() => {
    if (!selectedToken || !selectedTokenAmountFormatted) {
      return undefined
    }

    const amountNum = tryParseFloat(selectedTokenAmountFormatted)
    if (amountNum === undefined) {
      return undefined
    }

    return parseToBigNumber(amountNum, selectedToken.decimals)
  }, [selectedToken, selectedTokenAmountFormatted])

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta | undefined) => {
    clearInfoMessage()
    setSelectedBlockchain(blockchainToUpdate)
  }, [clearInfoMessage])

  const selectTokenHandler = useCallback((tokenToUpdate: Token | undefined) => {
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

  const successHandler = useCallback(async (blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => {
    const sendSuccess = async () => {
      try {
        removeInfoMessage(INFO_MESSAGE_ACCOUNT_PAYMENT_SUCCESS_ERROR)

        const currencyAmountNum = tryParseFloat(selectedCurrencyAmount)
        if (selectedBlockchain?.name && selectedCurrency?.symbol && currencyAmountNum !== undefined && hash) {
          await successPayment(
            ApiWrapper.instance.successRequest(
              [blockchain.name.toLocaleLowerCase(), hash, 0].join('_'),
              selectedBlockchain.name,
              hash,
              0,
              selectedCurrency.symbol,
              currencyAmountNum,
              i18n.resolvedLanguage ?? 'EN',
              selectedComment ?? null
            )
          )
        }
      } catch (error) {
        addInfoMessage(
          t('components.payment.errors.fail_success'),
          INFO_MESSAGE_ACCOUNT_PAYMENT_SUCCESS_ERROR,
          'danger',
          error
        )
      }
    }

    setPayResults(val => {
      if (val[blockchain.name] && val[blockchain.name].hash === hash) {
        return val
      }

      const res = { ...val }
      res[blockchain.name] = { blockchain, hash, message }
      return res
    })

    sendSuccess()
  }, [selectedBlockchain?.name, selectedComment, selectedCurrency?.symbol, selectedCurrencyAmount, i18n.resolvedLanguage, t, successPayment, addInfoMessage, removeInfoMessage])

  const removePayResultHandler = (blockchain: string) => {
    setPayResults(val => {
      const res = { ...val }
      delete res[blockchain]
      return res
    })
  }

  useEffect(() => {
    setSelectedTokenAmountFormatted(current => {
      if (current !== undefined) {
        return current
      }

      const queryParams = new URLSearchParams(location.search)
      return queryParams.get('tokenAmount') ?? undefined
    })
  }, [location.search])

  useEffect(() => {
    setSelectedCurrencyAmount(current => {
      if (current !== undefined) {
        return current
      }

      if (selectedToken?.usdPrice && exchangeRate.data) {
        const queryParams = new URLSearchParams(location.search)
        const initialTokenAmount = queryParams.get('tokenAmount')
        const initialTokenAmountNum = tryParseFloat(initialTokenAmount)
        if (initialTokenAmountNum) {
          const tokenAmount = parseToBigNumber(initialTokenAmountNum, selectedToken.decimals)
          return tokenAmountToCurrency(tokenAmount.toString(), selectedToken.usdPrice, selectedToken.decimals, exchangeRate.data).toString()
        }
      }

      return current
    })
  }, [location.search, exchangeRate.data, selectedToken?.decimals, selectedToken?.usdPrice])

  useEffect(() => {
    const currencyAmountNum = tryParseFloat(selectedCurrencyAmount)
    if (selectedToken?.usdPrice && currencyAmountNum && exchangeRate.data) {
      const tokenAmount = currencyToTokenAmount(currencyAmountNum, selectedToken.usdPrice, selectedToken.decimals, exchangeRate.data)
      setSelectedTokenAmountFormatted(formatToFixed(tokenAmount, selectedToken.decimals))
    } else {
      setSelectedTokenAmountFormatted('')
    }
  }, [exchangeRate.data, selectedCurrencyAmount, selectedToken?.decimals, selectedToken?.usdPrice])

  useEffect(() => {
    setSelectedAddress(current => {
      if (current !== undefined) {
        return current
      }

      const queryParams = new URLSearchParams(location.search)
      const address = queryParams.get('address')

      return address ?? undefined
    })
  }, [location.search])

  useEffect(() => {
    setSelectedComment(current => {
      if (current !== undefined) {
        return current
      }

      const queryParams = new URLSearchParams(location.search)
      const comment = queryParams.get('comment')

      return comment ? decodeURIComponent(comment) : undefined
    })
  }, [location.search])

  useEffect(() => {
    const res = !!selectedBlockchain
      && !!selectedToken
      && !!selectedAddress
      && !!selectedTokenAmount
      && selectedTokenAmount > BigInt(0)
      && (!selectedComment || selectedComment.length <= PAYMENT_MAX_COMMENT_LENGTH)

    setIsValid(res)
  }, [selectedAddress, selectedBlockchain, selectedComment, selectedToken, selectedTokenAmount])

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
        <div className="mb-2">
          <PaymentBlockchainButton onUpdate={selectBlockchainHandler} />
        </div>

        <div className="mb-2">
          <PaymentTokenButton blockchain={selectedBlockchain} currency={selectedCurrency} tokenAmount={selectedTokenAmount} onUpdate={selectTokenHandler} />
        </div>

        <Row>
          <Col>
            <div className="mb-2">
              <PaymentCurrencyDropdown onUpdate={selectCurrencyHandler} />
            </div>

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
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t('components.payment.comment')}
              value={selectedComment ?? ''}
              onChange={e => setSelectedComment(e.target.value)}
            />
            {(!!selectedComment && selectedComment.length > PAYMENT_MAX_COMMENT_LENGTH) && (
              <Form.Text className="text-danger">
                {t('components.payment.errors.comment_limit_exceed')}
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
            disabled={!isValid}
            onSuccess={successHandler}
          />
        </div>
      </Form >
    </>
  )
}

export default Payment
