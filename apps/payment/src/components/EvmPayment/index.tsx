import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { currencyToTokenAmount, isAssetEqualToToken, isNativeAsset, isNativeToken } from '../../libs/utils'
import TokenConversionCard from './components/TokenConversionCard'
import EmailInput from './components/EmailInput'
import ConnectButton from './components/ConnectButton'
import PayButton from './components/PayButton'
import usePaymentDetails from '../../libs/hooks/usePaymentDetails'
import { useExchangeRate, usePaymentSettings } from '../../states/settings/hook'
import useNavigateSuccess from '../../libs/hooks/useNavigateSuccess'
import useNativePay from '../../libs/hooks/useNativePay'
import usePaymentData from '../../libs/hooks/usePaymentData'
import TokenButton from './components/TokenButton'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_PROCESSING_ERROR } from '../../constants'
import useTokenApproveAndPay from '../../libs/hooks/useTokenApproveAndPay'
import { NativePayStage, TokenConvertStage, TokenPayStage } from '../../types/contract-call-result'
import useTokenConvertAndNativePay from '../../libs/hooks/useTokenConvertAndNativePay'
import useTokenConvertAndTokenPay from '../../libs/hooks/useTokenConvertAndTokenPay'

interface EvmPaymentProps {
  blockchain: BlockchainMeta
  restCurrencyAmount: number
  receivedCurrencyAmount: number
}

const EvmPayment: React.FC<EvmPaymentProps> = (props) => {
  const { blockchain, restCurrencyAmount, receivedCurrencyAmount } = props

  const [fromToken, setFromToken] = useState<Token | undefined>(undefined)
  const [toToken, setToToken] = useState<Token | undefined>(undefined)
  const [fromTokenAmount, setFromTokenAmount] = useState<string | undefined>(undefined)
  const [toTokenAmount, setToTokenAmount] = useState<string | undefined>(undefined)
  const [slippage, setSlippage] = useState<number | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [isForceRefreshConversion, setIsForceRefreshConversion] = useState(false)
  const [isForceRefreshToken, setIsForceRefreshToken] = useState(false)

  const { t } = useTranslation()
  const { isConnected } = useAccount()

  const { currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()
  const paymentDetails = usePaymentDetails(blockchain, fromToken, blockchain, toToken, fromTokenAmount, toTokenAmount, slippage, restCurrencyAmount, currency)
  const exchangeRate = useExchangeRate()

  const navigateSuccessHandler = useNavigateSuccess(blockchain?.name, email)
  const { addInfoMessage, clearInfoMessage, removeInfoMessage } = useInfoMessages()

  const needConversion = useMemo(() => {
    return !!fromToken && paymentSettings?.assets.findIndex(asset => isAssetEqualToToken(asset, fromToken)) === -1
  }, [fromToken, paymentSettings?.assets])

  useEffect(() => {
    if (needConversion) {
      return
    }

    const fromTokenAmountTmp = fromToken?.usdPrice && exchangeRate
      ? currencyToTokenAmount(restCurrencyAmount, fromToken.usdPrice, fromToken.decimals, exchangeRate)
      : undefined

    const toTokenAmountTmp = toToken?.usdPrice && exchangeRate
      ? currencyToTokenAmount(restCurrencyAmount, toToken.usdPrice, toToken.decimals, exchangeRate)
      : undefined

    setToToken(fromToken)
    setFromTokenAmount(fromTokenAmountTmp)
    setToTokenAmount(toTokenAmountTmp)
    setSlippage(undefined)
  }, [restCurrencyAmount, exchangeRate, fromToken, toToken, needConversion])

  const selectTokenHandler = useCallback((tokenToUpdate: Token | undefined) => {
    clearInfoMessage()
    setFromToken(tokenToUpdate)
  }, [clearInfoMessage])

  const updateConversionHandler = useCallback((toTokenToUpdate: Token | undefined, tokenAmountToUpdate: string | undefined, slippageToUpdate: number) => {
    setFromTokenAmount(tokenAmountToUpdate)

    const toTokenAmountTmp = toTokenToUpdate?.usdPrice && exchangeRate
      ? currencyToTokenAmount(restCurrencyAmount, toTokenToUpdate.usdPrice, toTokenToUpdate.decimals, exchangeRate)
      : undefined
    setToToken(toTokenToUpdate)
    setToTokenAmount(toTokenAmountTmp)

    setSlippage(slippageToUpdate)
  }, [restCurrencyAmount, exchangeRate])

  const changeEmailHandler = useCallback((emailToUpdate: string) => {
    setEmail(emailToUpdate)
  }, [])

  const errorHandler = useCallback((error: Error | undefined) => {
    addInfoMessage(t('components.evm_payment.errors.failed_pay'), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger', error)
    setIsForceRefreshConversion(true)
    setIsForceRefreshToken(true)
  }, [t, addInfoMessage])

  const successHandler = useCallback((txId: string | undefined) => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_PROCESSING_ERROR)
    navigateSuccessHandler(txId)
  }, [navigateSuccessHandler, removeInfoMessage])

  const forceRefreshConversionEndHandler = useCallback(() => {
    setIsForceRefreshConversion(false)
  }, [])

  const forceRefreshTokenEndHandler = useCallback(() => {
    setIsForceRefreshToken(false)
  }, [])

  return (
    <>
      <div className="mb-2">
        <TokenButton
          blockchain={blockchain}
          token={fromToken}
          tokenAmount={fromTokenAmount}
          isForceRefresh={isForceRefreshToken}
          onForceRefreshEnd={forceRefreshTokenEndHandler}
          onUpdate={selectTokenHandler}
        />
      </div>

      {(!!fromToken && !!paymentSettings && needConversion) && (
        <div className="mb-2">
          <TokenConversionCard
            blockchain={blockchain}
            token={fromToken}
            amount={restCurrencyAmount}
            isForceRefresh={isForceRefreshConversion}
            onForceRefreshEnd={forceRefreshConversionEndHandler}
            onUpdate={updateConversionHandler}
          />
        </div>
      )}

      <div className="mb-2">
        <EmailInput email={email} onChange={changeEmailHandler} />
      </div>

      {!isConnected && (
        <div className="d-grid mb-2">
          <ConnectButton />
        </div>
      )}

      {(isConnected && (!paymentDetails || !blockchain || !fromToken)) && (
        <div className="d-grid mb-2">
          <Button variant="primary" size="lg" disabled>
            {t('components.evm_payment.pay')}
          </Button>
        </div>
      )}

      {(isConnected && !!paymentDetails && !isAssetEqualToToken(paymentDetails.toToken, paymentDetails.fromToken) && isNativeAsset(paymentDetails.toBlockchain, paymentDetails.toToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
            stages={
              [...Object.values(TokenConvertStage), ...Object.values(NativePayStage)]
            }
            usePay={useTokenConvertAndNativePay}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(isConnected && !!paymentDetails && !isAssetEqualToToken(paymentDetails.toToken, paymentDetails.fromToken) && !isNativeAsset(paymentDetails.toBlockchain, paymentDetails.toToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
            stages={
              [...Object.values(TokenConvertStage), ...Object.values(TokenPayStage)]
            }
            usePay={useTokenConvertAndTokenPay}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(isConnected && !!paymentDetails && !!blockchain && isAssetEqualToToken(paymentDetails.toToken, paymentDetails.fromToken) && isNativeToken(blockchain, paymentDetails.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
            stages={Object.values(NativePayStage)}
            usePay={useNativePay}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(isConnected && !!paymentDetails && !!blockchain && isAssetEqualToToken(paymentDetails.toToken, paymentDetails.fromToken) && !isNativeToken(blockchain, paymentDetails.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
            stages={Object.values(TokenPayStage)}
            usePay={useTokenApproveAndPay}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}
    </>
  )
}

export default EvmPayment
