import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useCallback, useEffect, useState } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { parseUnits } from 'viem'

import { currencyToTokenAmount, isNativeToken, roundNumber, tokenAmountToCurrency } from '../../libs/utils'
import { useExchangeRate, usePaymentSettings, useTokens } from '../../states/settings/hook'
import usePaymentData from '../../libs/hooks/usePaymentData'
import EmailInput from './components/EmailInput'
import AmountInput from './components/AmountInput'
import AddressInput from './components/AddressInput'
import PayLink from './components/PayLink'
import StatusButton from './components/StatusButton'
import useNavigateSuccess from '../../libs/hooks/useNavigateSuccess'
import useAccountReceivedAmount from '../../libs/hooks/useAccountReceivedAmount'
import { useInfoMessages } from '../../states/application/hook'
import { DEFAULT_CURRENCY_DECIMAL_PLACES, INFO_MESSAGE_NATIVE_TOKEN_NOT_FOUND_ERROR, INFO_MESSAGE_RECEIVED_AMOUNT_ERROR, INFO_MESSAGE_TOKEN_PRICE_NOT_DEFINED_ERROR, INFO_MESSAGE_WALLET_NOT_FOUND_ERROR } from '../../constants'

interface TransferPaymentProps {
  blockchain: BlockchainMeta
}

const TransferPayment: React.FC<TransferPaymentProps> = (props) => {
  const { blockchain } = props

  const [email, setEmail] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [token, setToken] = useState<Token | null>(null)
  const [requiredTokenAmount, setRequiredTokenAmount] = useState<string>('0')
  const [receivedTokenAmount, setReceivedTokenAmount] = useState<string>('0')
  const [receivedCurrencyAmount, setReceivedCurrencyAmount] = useState<number>(0)
  const [restTokenAmount, setRestTokenAmount] = useState<string>('0')
  const [restCurrencyAmount, setRestCurrencyAmount] = useState<number>(0)

  const { t } = useTranslation()

  const { amount: requiredCurrencyAmount, currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()
  const exchangeRate = useExchangeRate()
  const tokens = useTokens()
  const navigateSuccessHandler = useNavigateSuccess(blockchain.name, email)
  const { status: receivedAmountStatus, data: receivedAmountData, error: receivedAmountError } = useAccountReceivedAmount(blockchain)
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (!paymentSettings) {
      return
    }

    const wallet = paymentSettings.wallets.find(
      item => item.blockchain.toLocaleLowerCase() === blockchain.name.toLocaleLowerCase()
    )
    if (!wallet) {
      addInfoMessage(t('components.transfer_payment.errors.wallet_not_found'), INFO_MESSAGE_WALLET_NOT_FOUND_ERROR, 'danger')
      return
    }

    removeInfoMessage(INFO_MESSAGE_WALLET_NOT_FOUND_ERROR)
    setAddress(wallet.address)
  }, [blockchain.name, paymentSettings, t, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (!tokens) {
      return
    }

    const tmpToken = tokens?.find(token => isNativeToken(blockchain, token))
    if (!tmpToken) {
      addInfoMessage(t('components.transfer_payment.errors.native_token_not_found'), INFO_MESSAGE_NATIVE_TOKEN_NOT_FOUND_ERROR, 'danger')
      return
    }

    removeInfoMessage(INFO_MESSAGE_NATIVE_TOKEN_NOT_FOUND_ERROR)
    if (!tmpToken.usdPrice) {
      addInfoMessage(t('components.transfer_payment.errors.native_token_price_not_defined'), INFO_MESSAGE_TOKEN_PRICE_NOT_DEFINED_ERROR, 'danger')
      return
    }

    removeInfoMessage(INFO_MESSAGE_TOKEN_PRICE_NOT_DEFINED_ERROR)
    setToken(tmpToken)
  }, [blockchain, tokens, t, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (!token?.usdPrice || !exchangeRate) {
      return
    }

    const tmpRequiredTokenAmount = currencyToTokenAmount(requiredCurrencyAmount, token.usdPrice, token.decimals, exchangeRate)
    setRequiredTokenAmount(tmpRequiredTokenAmount)
  }, [exchangeRate, requiredCurrencyAmount, token?.decimals, token?.usdPrice])

  useEffect(() => {
    if (receivedAmountStatus !== 'success' || !receivedAmountData || !token?.usdPrice || !exchangeRate) {
      return
    }

    const tmpReceivedTokenAmount = parseUnits(receivedAmountData.received.toString(), token.decimals)
    const tmpReceivedTokenAmountStr = tmpReceivedTokenAmount.toString()
    const tmpReceivedCurrencyAmount = tokenAmountToCurrency(tmpReceivedTokenAmountStr, token.usdPrice, token.decimals, exchangeRate)

    const delta = requiredCurrencyAmount - tmpReceivedCurrencyAmount
    const tmpRestCurrencyAmount = delta <= 0 ? 0 : delta
    const tmpRestTokenAmount = tmpRestCurrencyAmount === 0 ? '0' : currencyToTokenAmount(tmpRestCurrencyAmount, token.usdPrice, token.decimals, exchangeRate)

    setReceivedTokenAmount(tmpReceivedTokenAmountStr)
    setReceivedCurrencyAmount(tmpReceivedCurrencyAmount)
    setRestTokenAmount(tmpRestTokenAmount)
    setRestCurrencyAmount(tmpRestCurrencyAmount)

    if (roundNumber(tmpReceivedCurrencyAmount, DEFAULT_CURRENCY_DECIMAL_PLACES) >= requiredCurrencyAmount) {
      navigateSuccessHandler()
    }
  }, [requiredCurrencyAmount, exchangeRate, receivedAmountData, receivedAmountStatus, token?.decimals, token?.usdPrice, navigateSuccessHandler])

  useEffect(() => {
    if (receivedAmountStatus === 'error') {
      addInfoMessage(t('components.transfer_payment.errors.received_amount_error'), INFO_MESSAGE_RECEIVED_AMOUNT_ERROR, 'danger', receivedAmountError)
    } else {
      removeInfoMessage(INFO_MESSAGE_RECEIVED_AMOUNT_ERROR)
    }
  }, [receivedAmountStatus, receivedAmountError, t, addInfoMessage, removeInfoMessage])

  const changeEmailHandler = useCallback((emailToUpdate: string) => {
    setEmail(emailToUpdate)
  }, [])

  return (
    <>
      {!token && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
          <span className="visually-hidden">{t('common.processing')}</span>
        </Spinner>
      )}

      {(!!token) && (
        <>
          <Row>
            <Col sm={6}>
              <div className="mb-2">
                <PayLink blockchain={blockchain} token={token} address={address} tokenAmount={restTokenAmount} />
              </div>
            </Col>
            <Col sm={6}>
              <div className='mb-2'>
                <AmountInput token={token} tokenAmount={restTokenAmount} currencyAmount={restCurrencyAmount} currency={currency} />
              </div>

              <div className='mb-2'>
                <AddressInput address={address} />
              </div>

              <div className='mb-2'>
                <EmailInput email={email} onChange={changeEmailHandler} />
              </div>
            </Col>
          </Row>

          <div className="d-grid mb-2">
            <StatusButton
              token={token}
              currency={currency}
              tokenAmount={requiredTokenAmount}
              currencyAmount={requiredCurrencyAmount}
              receivedTokenAmount={receivedTokenAmount}
              receivedCurrencyAmount={receivedCurrencyAmount}
            />
          </div>
        </>
      )}
    </>
  )
}

export default TransferPayment
