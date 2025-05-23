import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useCallback, useEffect, useState } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { currencyToTokenAmount, isNativeToken, roundNumber } from '../../libs/utils'
import { useExchangeRate, usePaymentSettings, useTokens } from '../../states/settings/hook'
import usePaymentData from '../../libs/hooks/usePaymentData'
import EmailInput from './components/EmailInput'
import AmountInput from './components/AmountInput'
import AddressInput from './components/AddressInput'
import PayLink from './components/PayLink'
import StatusButton from './components/StatusButton'
import { useInfoMessages } from '../../states/application/hook'
import { DEFAULT_CURRENCY_DECIMAL_PLACES, INFO_MESSAGE_NATIVE_TOKEN_NOT_FOUND_ERROR, INFO_MESSAGE_TOKEN_PRICE_NOT_DEFINED_ERROR, INFO_MESSAGE_WALLET_NOT_FOUND_ERROR } from '../../constants'
import { useInterval } from '../../libs/hooks/useInterval'
import usePaymentRestAmount from '../../libs/hooks/usePaymentRestAmount'
import useNavigateSuccess from '../../libs/hooks/useNavigateSuccess'

interface TransferPaymentProps {
  blockchain: BlockchainMeta
  restCurrencyAmount: number
  receivedCurrencyAmount: number
}

const TransferPayment: React.FC<TransferPaymentProps> = (props) => {
  const { blockchain } = props

  const [restCurrencyAmount, setRestCurrencyAmount] = useState(props.restCurrencyAmount)
  const [receivedCurrencyAmount, setReceivedCurrencyAmount] = useState(props.receivedCurrencyAmount)
  const [tokenAmount, setTokenAmount] = useState('0')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [token, setToken] = useState<Token | null>(null)

  const { t } = useTranslation()

  const { currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()
  const exchangeRate = useExchangeRate()
  const tokens = useTokens()
  const navigateSuccessHandler = useNavigateSuccess(blockchain?.name, email)
  const {
    restCurrencyAmount: restCurrencyAmountUpdated,
    receivedCurrencyAmount: receivedCurrencyAmountUpdated,
    status: reloadReceivedAmountStatus,
    reload: reloadReceivedAmount
  } = usePaymentRestAmount()
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
    if (['success', 'error'].includes(reloadReceivedAmountStatus)) {
      setReceivedCurrencyAmount(receivedCurrencyAmountUpdated)
    }
  }, [reloadReceivedAmountStatus, receivedCurrencyAmountUpdated])

  useEffect(() => {
    if (['success', 'error'].includes(reloadReceivedAmountStatus)) {
      setRestCurrencyAmount(restCurrencyAmountUpdated)
    }
  }, [reloadReceivedAmountStatus, restCurrencyAmountUpdated])

  useEffect(() => {
    if (roundNumber(restCurrencyAmount, DEFAULT_CURRENCY_DECIMAL_PLACES) === 0) {
      navigateSuccessHandler()
    }
  }, [restCurrencyAmount, navigateSuccessHandler])

  useEffect(() => {
    if (!token?.usdPrice || !exchangeRate) {
      return
    }

    const tokenAmountTmp = currencyToTokenAmount(restCurrencyAmount, token.usdPrice, token.decimals, exchangeRate)
    setTokenAmount(tokenAmountTmp)
  }, [restCurrencyAmount, exchangeRate, token?.decimals, token?.usdPrice])

  const changeEmailHandler = useCallback((emailToUpdate: string) => {
    setEmail(emailToUpdate)
  }, [])

  useInterval(reloadReceivedAmount, 1000 * 10, false)

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
                <PayLink blockchain={blockchain} token={token} address={address} tokenAmount={tokenAmount} />
              </div>
            </Col>
            <Col sm={6}>
              <div className='mb-2'>
                <AmountInput token={token} tokenAmount={tokenAmount} currencyAmount={restCurrencyAmount} currency={currency} />
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
              tokenAmount={tokenAmount}
              restCurrencyAmount={restCurrencyAmount}
              receivedCurrencyAmount={receivedCurrencyAmount}
            />
          </div>
        </>
      )}
    </>
  )
}

export default TransferPayment
