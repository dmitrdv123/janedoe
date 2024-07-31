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
import { DEFAULT_SLIPPAGE, INFO_MESSAGE_PAYMENT_PROCESSING_ERROR } from '../../constants'
import useTokenApproveAndPay from '../../libs/hooks/useTokenApproveAndPay'
import { ConvertNativePayStage, ConvertTokenPayStage, NativePayStage, TokenPayStage } from '../../types/contract-call-result'
import useTokenConvertAndNativePay from '../../libs/hooks/useTokenConvertAndNativePay'
import useTokenConvertAndTokenPay from '../../libs/hooks/useTokenConvertAndTokenPay'
import { PaymentDetails } from '../../types/payment-details'
import PaymentDetailsInfo from './components/PaymentDetailsInfo'

interface EvmPaymentProps {
  blockchain: BlockchainMeta
  restCurrencyAmount: number
  receivedCurrencyAmount: number
}

const EvmPayment: React.FC<EvmPaymentProps> = (props) => {
  const { blockchain, restCurrencyAmount, receivedCurrencyAmount } = props

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentDetailsCurrent, setPaymentDetailsCurrent] = useState<PaymentDetails | undefined>(undefined)
  const [fromToken, setFromToken] = useState<Token | undefined>(undefined)
  const [toToken, setToToken] = useState<Token | undefined>(undefined)
  const [fromTokenAmount, setFromTokenAmount] = useState<string | undefined>(undefined)
  const [toTokenAmount, setToTokenAmount] = useState<string | undefined>(undefined)
  const [toTokenSwapAmount, setToTokenSwapAmount] = useState<string | undefined>(undefined)
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE)
  const [email, setEmail] = useState('')
  const [isForceRefreshConversion, setIsForceRefreshConversion] = useState(false)
  const [isForceRefreshToken, setIsForceRefreshToken] = useState(false)

  const { t } = useTranslation()
  const { address, status: connectStatus } = useAccount()

  const { id, paymentId, currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()
  const paymentDetails = usePaymentDetails(id, paymentId, address, address, blockchain, fromToken, blockchain, toToken, fromTokenAmount, toTokenAmount, toTokenSwapAmount, slippage, restCurrencyAmount, currency)
  const exchangeRate = useExchangeRate()

  const navigateSuccessHandler = useNavigateSuccess(blockchain?.name, email)
  const { addInfoMessage, clearInfoMessage, removeInfoMessage } = useInfoMessages()

  const needConversion = useMemo(() => {
    return !!fromToken && paymentSettings?.assets && paymentSettings.assets.findIndex(asset => isAssetEqualToToken(asset, fromToken)) === -1
  }, [fromToken, paymentSettings?.assets])

  useEffect(() => {
    if (isProcessing) {
      return
    }

    setPaymentDetailsCurrent(paymentDetails)
  }, [isProcessing, paymentDetails])

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
    setToTokenSwapAmount(toTokenAmountTmp)
    setSlippage(DEFAULT_SLIPPAGE)
  }, [restCurrencyAmount, exchangeRate, fromToken, toToken, needConversion])

  const selectTokenHandler = useCallback((tokenToUpdate: Token | undefined) => {
    clearInfoMessage()
    setFromToken(tokenToUpdate)
  }, [clearInfoMessage])

  const updateConversionHandler = useCallback((toTokenToUpdate: Token | undefined, fromTokenAmountToUpdate: string | undefined, toTokenSwapAmountToUpdate: string | undefined, slippageToUpdate: number) => {
    const toTokenAmountToUpdate = toTokenToUpdate?.usdPrice && exchangeRate
      ? currencyToTokenAmount(restCurrencyAmount, toTokenToUpdate.usdPrice, toTokenToUpdate.decimals, exchangeRate)
      : undefined

    setFromTokenAmount(fromTokenAmountToUpdate)
    setToToken(toTokenToUpdate)
    setToTokenAmount(toTokenAmountToUpdate)
    setToTokenSwapAmount(toTokenSwapAmountToUpdate)

    setSlippage(slippageToUpdate)
  }, [exchangeRate, restCurrencyAmount])

  const changeEmailHandler = useCallback((emailToUpdate: string) => {
    setEmail(emailToUpdate)
  }, [])

  const processingHandler = useCallback(() => {
    setIsProcessing(true)
  }, [])

  const errorHandler = useCallback((error: Error | undefined) => {
    addInfoMessage(t('components.evm_payment.errors.failed_pay'), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger', error)
    setIsForceRefreshConversion(true)
    setIsForceRefreshToken(true)
    setIsProcessing(false)
  }, [t, addInfoMessage])

  const errorConvertAndPayHandler = useCallback((error: Error | undefined, stage: string | undefined) => {
    addInfoMessage(t('components.evm_payment.errors.failed_pay'), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger', error)
    setIsForceRefreshConversion(true)
    setIsForceRefreshToken(true)
    setIsProcessing(false)

    if (stage === ConvertNativePayStage.NativePay || stage === ConvertTokenPayStage.TokenPay) {
      setFromToken(toToken)
    }
  }, [toToken, t, addInfoMessage])

  const successHandler = useCallback((txId: string | undefined) => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_PROCESSING_ERROR)
    navigateSuccessHandler(txId)
    setIsProcessing(false)
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

      {(!!fromToken && needConversion) && (
        <div className="mb-2">
          <TokenConversionCard
            fromBlockchain={blockchain}
            fromToken={fromToken}
            toToken={toToken}
            slippage={slippage}
            currencyAmount={restCurrencyAmount}
            isForceRefresh={isForceRefreshConversion}
            onForceRefreshEnd={forceRefreshConversionEndHandler}
            onUpdate={updateConversionHandler}
          />
        </div>
      )}

      <div className="mb-2">
        <EmailInput email={email} onChange={changeEmailHandler} />
      </div>

      {(connectStatus === 'connected' && !!paymentDetailsCurrent) && (
        <PaymentDetailsInfo paymentDetails={paymentDetailsCurrent} restCurrencyAmount={restCurrencyAmount} receivedCurrencyAmount={receivedCurrencyAmount} />
      )}

      {(connectStatus !== 'connected') && (
        <div className="d-grid mb-2">
          <ConnectButton />
        </div>
      )}

      {(connectStatus === 'connected' && !paymentDetailsCurrent) && (
        <div className="d-grid mb-2">
          <Button variant="primary" size="lg" disabled>
            {t('components.evm_payment.pay')}
          </Button>
        </div>
      )}

      {(connectStatus === 'connected' && !!paymentDetailsCurrent && !isAssetEqualToToken(paymentDetailsCurrent.toToken, paymentDetailsCurrent.fromToken) && isNativeAsset(paymentDetailsCurrent.toBlockchain, paymentDetailsCurrent.toToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            title={t('components.evm_payment.swap_and_pay')}
            paymentDetails={paymentDetailsCurrent}
            stages={
              [...Object.values(ConvertNativePayStage)]
            }
            usePay={useTokenConvertAndNativePay}
            onProcessing={processingHandler}
            onError={errorConvertAndPayHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(connectStatus === 'connected' && !!paymentDetailsCurrent && !isAssetEqualToToken(paymentDetailsCurrent.toToken, paymentDetailsCurrent.fromToken) && !isNativeAsset(paymentDetailsCurrent.toBlockchain, paymentDetailsCurrent.toToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            title={t('components.evm_payment.swap_and_pay')}
            paymentDetails={paymentDetailsCurrent}
            stages={
              [...Object.values(ConvertTokenPayStage)]
            }
            usePay={useTokenConvertAndTokenPay}
            onProcessing={processingHandler}
            onError={errorConvertAndPayHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(connectStatus === 'connected' && !!paymentDetailsCurrent && isAssetEqualToToken(paymentDetailsCurrent.toToken, paymentDetailsCurrent.fromToken) && isNativeToken(blockchain, paymentDetailsCurrent.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            title={t('components.evm_payment.pay')}
            paymentDetails={paymentDetailsCurrent}
            stages={Object.values(NativePayStage)}
            usePay={useNativePay}
            onProcessing={processingHandler}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(connectStatus === 'connected' && !!paymentDetailsCurrent && isAssetEqualToToken(paymentDetailsCurrent.toToken, paymentDetailsCurrent.fromToken) && !isNativeToken(blockchain, paymentDetailsCurrent.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            title={t('components.evm_payment.pay')}
            paymentDetails={paymentDetailsCurrent}
            stages={Object.values(TokenPayStage)}
            usePay={useTokenApproveAndPay}
            onProcessing={processingHandler}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}
    </>
  )
}

export default EvmPayment
