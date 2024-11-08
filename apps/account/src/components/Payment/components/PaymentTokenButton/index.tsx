import { Form } from 'react-bootstrap'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { ApplicationModal } from '../../../../types/application-modal'
import { useToggleModal } from '../../../../states/application/hook'
import PaymentTokensModal from '../PaymentTokensModal'
import { TokenExt } from '../../../../types/token-ext'
import { AppSettingsCurrency } from '../../../../types/app-settings'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'
import { isBlockchainAsset, isBlockchainToken, sameToken, sameTokenAndAsset, stringToAsset, tokenAmountToCurrency, tokenAmountToUsd, tokenExtResultComparator } from '../../../../libs/utils'
import { useAccountPaymentSettings } from '../../../../states/account-settings/hook'
import useReadBalances from '../../../../libs/hooks/useReadBalances'
import useSpecificExchangeRate from '../../../../libs/hooks/useSpecificExchangeRate'
import { useTokens } from '../../../../states/meta/hook'

interface PaymentTokenButtonProps {
  blockchain: BlockchainMeta | undefined
  tokenAmount: bigint | undefined
  currency: AppSettingsCurrency | undefined
  onUpdate: (token: Token | undefined) => void
}

const PaymentTokenButton: React.FC<PaymentTokenButtonProps> = (props) => {
  const { blockchain, currency, tokenAmount, onUpdate } = props

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined)

  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.TOKEN_PAYMENT)
  const accountPaymentSettings = useAccountPaymentSettings()
  const exchangeRate = useSpecificExchangeRate(currency?.symbol)
  const tokens = useTokens()

  const {
    tokens: tokensWithBalance
  } = useReadBalances(blockchain)

  const preparedTokens = useMemo(() => {
    if (!blockchain || !accountPaymentSettings || !tokensWithBalance) {
      return undefined
    }

    return tokens
      ?.filter(
        token => blockchain.name.toLocaleLowerCase() === token.blockchain.toLocaleLowerCase()
      )
      .map(token => {
        const tokenWithBalance = tokensWithBalance.find(item => sameToken(item, token))
        const tokenBalanceUsd = tokenWithBalance && token.usdPrice ? tokenAmountToUsd(tokenWithBalance.balance.toString(), token.usdPrice, token.decimals) : null

        const result: TokenExt = {
          ...token,
          settingIndex: accountPaymentSettings.assets.findIndex(asset => sameTokenAndAsset(asset, token)),
          balance: tokenWithBalance?.balance.toString() ?? null,
          balanceUsd: tokenBalanceUsd
        }

        return result
      })
      .sort(tokenExtResultComparator)
  }, [accountPaymentSettings, blockchain, tokens, tokensWithBalance])

  const selectedTokenBalance = useMemo(() => {
    const tokenWithBalance = selectedToken && tokensWithBalance
      ? tokensWithBalance.find(item => sameToken(item, selectedToken))
      : undefined
    return tokenWithBalance?.balance
  }, [selectedToken, tokensWithBalance])

  const selectedTokenCurrencyBalance = useMemo(() => {
    return selectedToken && selectedTokenBalance && selectedToken.usdPrice && exchangeRate.data
      ? tokenAmountToCurrency(selectedTokenBalance.toString(), selectedToken.usdPrice, selectedToken.decimals, exchangeRate.data)
      : undefined
  }, [exchangeRate.data, selectedToken, selectedTokenBalance])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectTokenHandler = useCallback((tokenToUpdate: TokenExt) => {
    setSelectedToken(tokenToUpdate)
  }, [])

  useEffect(() => {
    setSelectedToken(current => {
      if (!blockchain || !tokens || !accountPaymentSettings) {
        return undefined
      }

      const queryParams = new URLSearchParams(location.search)
      const initialAssetString = queryParams.get('token')
      if (initialAssetString) {
        const initialAsset = stringToAsset(initialAssetString)
        const initialToken = initialAsset
          ? tokens.find(token => sameTokenAndAsset(initialAsset, token) && isBlockchainToken(blockchain, token))
          : undefined
        if (initialToken) {
          return initialToken
        }
      }

      const asset = accountPaymentSettings.assets.find(asset => isBlockchainAsset(blockchain, asset))
      if (asset) {
        return tokens.find(token => sameTokenAndAsset(asset, token))
      }

      return current
    })
  }, [blockchain, tokens, accountPaymentSettings])

  useEffect(() => {
    onUpdate(selectedToken)
  }, [selectedToken, onUpdate])

  return (
    <>
      <PaymentTokensModal
        blockchain={blockchain}
        token={selectedToken}
        currency={currency}
        tokens={preparedTokens}
        exchangeRate={exchangeRate.data}
        onUpdate={selectTokenHandler}
      />

      <Form.Group>
        <Form.Control as="button" className="dropdown-toggle" onClick={openHandler} disabled={!preparedTokens || preparedTokens.length <= 1}>
          {selectedToken?.symbol ?? t('components.payment.select_token')}
        </Form.Control>

        {!selectedToken && (
          <div>
            <Form.Text className="text-danger">
              {t('components.payment.errors.token_required')}
            </Form.Text>
          </div>
        )}

        {(selectedTokenBalance !== undefined && tokenAmount !== undefined && selectedTokenBalance < tokenAmount) && (
          <div>
            <Form.Text className="text-danger">
              {t('components.payment.errors.no_balance')}
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

export default PaymentTokenButton
