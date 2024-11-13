import { Form } from 'react-bootstrap'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { useInfoMessages } from '../../../../states/application/hook'
import { AppSettingsCurrency } from '../../../../types/app-settings'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'
import { convertErrorToMessage, findNativeToken, parseToBigNumber, tokenAmountToCurrency } from '../../../../libs/utils'
import useSpecificExchangeRate from '../../../../libs/hooks/useSpecificExchangeRate'
import { useTokens } from '../../../../states/meta/hook'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import useApiRequestImmediate from '../../../../libs/hooks/useApiRequestImmediate'
import { AccountBlockchainBalance } from '../../../../types/account-blockchain-balance'
import { INFO_MESSAGE_BALANCE_ERROR } from '../../../../constants'

interface PaymentTokenTransferButtonProps {
  blockchain: BlockchainMeta
  currency: AppSettingsCurrency | undefined
  isForceRefresh: boolean
  onForceRefreshEnd: () => void
  onUpdate: (token: Token | undefined, balance: bigint | undefined) => void
}

const PaymentTokenTransferButton: React.FC<PaymentTokenTransferButtonProps> = (props) => {
  const { blockchain, currency, isForceRefresh, onForceRefreshEnd, onUpdate } = props

  const { t } = useTranslation()

  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const exchangeRate = useSpecificExchangeRate(currency?.symbol)
  const tokens = useTokens()

  const {
    data: accountBlockchainBalanceData,
    error: accountBlockchainBalanceError,
    reprocess: accountBlockchainBalanceDataReload
  } = useApiRequestImmediate<AccountBlockchainBalance>(
    ApiWrapper.instance.accountBlockchainBalanceRequest(blockchain.name)
  )

  const selectedToken = useMemo(() => {
    return tokens ? findNativeToken(blockchain, tokens) : undefined
  }, [blockchain, tokens])

  const selectedTokenBalance = useMemo(() => {
    const tokenWithBalance = selectedToken && accountBlockchainBalanceData
      ? parseToBigNumber(accountBlockchainBalanceData.balance, selectedToken.decimals)
      : undefined
    return tokenWithBalance
  }, [selectedToken, accountBlockchainBalanceData])

  const selectedTokenCurrencyBalance = useMemo(() => {
    return selectedToken && selectedTokenBalance && selectedToken.usdPrice && exchangeRate.data
      ? tokenAmountToCurrency(selectedTokenBalance.toString(), selectedToken.usdPrice, selectedToken.decimals, exchangeRate.data)
      : undefined
  }, [selectedToken, selectedTokenBalance, exchangeRate.data])

  useEffect(() => {
    if (accountBlockchainBalanceError) {
      addInfoMessage(convertErrorToMessage(accountBlockchainBalanceError, t('common.errors.default')), `${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`, 'danger')
    } else {
      removeInfoMessage(`${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`)
    }
  }, [blockchain.name, accountBlockchainBalanceError, t, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (isForceRefresh) {
      accountBlockchainBalanceDataReload?.()
      onForceRefreshEnd()
    }
  }, [isForceRefresh, onForceRefreshEnd, accountBlockchainBalanceDataReload])

  useEffect(() => {
    onUpdate(selectedToken, selectedTokenBalance)
  }, [selectedToken, selectedTokenBalance, onUpdate])

  return (
    <>
      <Form.Group>
        {!selectedToken && (
          <div>
            <Form.Text className="text-danger">
              {t('components.payment.errors.token_required')}
            </Form.Text>
          </div>
        )}

        {(!!selectedToken) && (
          <div>
            <Form.Text muted>
              <TokenAmountWithCurrency
                tokenSymbol={selectedToken.symbol}
                tokenDecimals={selectedToken.decimals}
                tokenAmount={selectedTokenBalance?.toString() ?? null}
                currency={currency?.symbol ?? null}
                currencyAmount={selectedTokenCurrencyBalance ?? null}
                hideZeroBalance
              />
            </Form.Text>
          </div>
        )}
      </Form.Group>
    </>
  )
}

export default PaymentTokenTransferButton
