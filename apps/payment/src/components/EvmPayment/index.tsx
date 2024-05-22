import { Asset, BlockchainMeta, Token } from 'rango-sdk-basic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { currencyToTokenAmount, isAssetEqualToToken, isNativeToken } from '../../libs/utils'
import TokenConversionCard from './components/TokenConversionCard'
import EmailInput from './components/EmailInput'
import ConnectButton from './components/ConnectButton'
import PayButton from './components/PayButton'
import usePaymentDetails from '../../libs/hooks/usePaymentDetails'
import { useExchangeRate, usePaymentSettings } from '../../states/settings/hook'
import useTokenConversionPay from '../../libs/hooks/useTokenConversionPay'
import useNavigateSuccess from '../../libs/hooks/useNavigateSuccess'
import useNativePay from '../../libs/hooks/useNativePay'
import usePaymentData from '../../libs/hooks/usePaymentData'
import TokenButton from './components/TokenButton'
import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_PROCESSING_ERROR } from '../../constants'
import useTokenApproveAndPay from '../../libs/hooks/useTokenApproveAndPay'

interface EvmPaymentProps {
  blockchain: BlockchainMeta
  restCurrencyAmount: number
  receivedCurrencyAmount: number
}

const EvmPayment: React.FC<EvmPaymentProps> = (props) => {
  const { blockchain, restCurrencyAmount, receivedCurrencyAmount } = props

  const [fromToken, setFromToken] = useState<Token | undefined>(undefined)
  const [toAsset, setToAsset] = useState<Asset | undefined>(undefined)
  const [tokenAmount, setTokenAmount] = useState<string | undefined>(undefined)
  const [slippage, setSlippage] = useState<number | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [isForceRefresh, setIsForceRefresh] = useState(false)

  const { t } = useTranslation()
  const { isConnected } = useAccount()

  const { currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()
  const paymentDetails = usePaymentDetails(blockchain, fromToken, toAsset, tokenAmount, slippage, restCurrencyAmount, currency)
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

    const tokenAmountTmp = fromToken?.usdPrice && exchangeRate
      ? currencyToTokenAmount(restCurrencyAmount, fromToken.usdPrice, fromToken.decimals, exchangeRate)
      : undefined

    setToAsset(fromToken)
    setTokenAmount(tokenAmountTmp)
    setSlippage(undefined)
  }, [restCurrencyAmount, exchangeRate, fromToken, needConversion])

  const selectTokenHandler = useCallback((tokenToUpdate: Token | undefined) => {
    clearInfoMessage()
    setFromToken(tokenToUpdate)
  }, [clearInfoMessage])

  const updateConversionHandler = useCallback((toAssetToUpdate: Asset | undefined, tokenAmountToUpdate: string | undefined, slippageToUpdate: number) => {
    setToAsset(toAssetToUpdate)
    setTokenAmount(tokenAmountToUpdate)
    setSlippage(slippageToUpdate)
  }, [])

  const changeEmailHandler = useCallback((emailToUpdate: string) => {
    setEmail(emailToUpdate)
  }, [])

  const errorHandler = useCallback((error: Error | undefined) => {
    addInfoMessage(t('components.evm_payment.errors.failed_pay'), INFO_MESSAGE_PAYMENT_PROCESSING_ERROR, 'danger', error)
    setIsForceRefresh(true)
  }, [t, addInfoMessage])

  const successHandler = useCallback((txId: string | undefined) => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_PROCESSING_ERROR)
    navigateSuccessHandler(txId)
  }, [navigateSuccessHandler, removeInfoMessage])

  const forceRefreshEndHandler = useCallback(() => {
    setIsForceRefresh(false)
  }, [])

  return (
    <>
      <div className="mb-2">
        <TokenButton blockchain={blockchain} token={fromToken} tokenAmount={tokenAmount} onUpdate={selectTokenHandler} />
      </div>

      {(!!fromToken && !!paymentSettings && needConversion) && (
        <div className="mb-2">
          <TokenConversionCard
            blockchain={blockchain}
            token={fromToken}
            amount={restCurrencyAmount}
            isForceRefresh={isForceRefresh}
            onForceRefreshEnd={forceRefreshEndHandler}
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

      {(isConnected && !!paymentDetails && !isAssetEqualToToken(paymentDetails.toAsset, paymentDetails.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
            usePay={useTokenConversionPay}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(isConnected && !!paymentDetails && !!blockchain && isAssetEqualToToken(paymentDetails.toAsset, paymentDetails.fromToken) && isNativeToken(blockchain, paymentDetails.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
            usePay={useNativePay}
            onError={errorHandler}
            onSuccess={successHandler}
          />
        </div>
      )}

      {(isConnected && !!paymentDetails && !!blockchain && isAssetEqualToToken(paymentDetails.toAsset, paymentDetails.fromToken) && !isNativeToken(blockchain, paymentDetails.fromToken)) && (
        <div className="d-grid mb-2">
          <PayButton
            paymentDetails={paymentDetails}
            receivedCurrencyAmount={receivedCurrencyAmount}
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
