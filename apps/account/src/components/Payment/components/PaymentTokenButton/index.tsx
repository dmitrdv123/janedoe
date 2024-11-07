import { Form } from 'react-bootstrap'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { ApplicationModal } from '../../../../types/application-modal'
import { useToggleModal } from '../../../../states/application/hook'
import PaymentTokensModal from '../PaymentTokensModal'
import { TokenExt } from '../../../../types/token-ext'
import { AppSettingsCurrency } from '../../../../types/app-settings'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'
import { isBlockchainAsset, sameToken, sameTokenAndAsset, stringToAsset, tokenAmountToCurrency, tokenAmountToUsd, tokenExtResultComparator } from '../../../../libs/utils'
import { useAccountPaymentSettings } from '../../../../states/account-settings/hook'
import useReadBalances from '../../../../libs/hooks/useReadBalances'
import useSpecificExchangeRate from '../../../../libs/hooks/useSpecificExchangeRate'
import { useTokens } from '../../../../states/meta/hook'

interface PaymentTokenButtonProps {
  selectedBlockchain: BlockchainMeta | undefined
  selectedTokenAmount: bigint | undefined
  selectedCurrency: AppSettingsCurrency | undefined
  onUpdate: (token: TokenExt | undefined) => void
}

const PaymentTokenButton: React.FC<PaymentTokenButtonProps> = (props) => {
  const { selectedBlockchain, selectedCurrency, selectedTokenAmount, onUpdate } = props

  const [selectedToken, setSelectedToken] = useState<TokenExt | undefined>(undefined)

  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.TOKEN_PAYMENT)
  const accountPaymentSettings = useAccountPaymentSettings()
  const exchangeRate = useSpecificExchangeRate(selectedCurrency?.symbol)
  const tokens = useTokens()

  const {
    tokens: tokensWithBalance
  } = useReadBalances(selectedBlockchain)

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

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectTokenHandler = useCallback((tokenToUpdate: TokenExt) => {
    setSelectedToken(tokenToUpdate)
  }, [])

  useEffect(() => {
    let token: TokenExt | undefined = undefined

    const asset = selectedBlockchain ? accountPaymentSettings?.assets.find(asset => isBlockchainAsset(selectedBlockchain, asset)) : undefined
    if (asset) {
      token = preparedTokens?.find(token => sameTokenAndAsset(asset, token))
    }

    setSelectedToken(token)
  }, [accountPaymentSettings?.assets, preparedTokens, selectedBlockchain, onUpdate])

  useEffect(() => {
    if (!selectedToken && selectedBlockchain) {
      const queryParams = new URLSearchParams(location.search)
      const initialAssetString = queryParams.get('token')
      if (initialAssetString) {
        const initialAsset = stringToAsset(initialAssetString)
        const initialToken = initialAsset
          ? preparedTokens?.find(token => sameTokenAndAsset(initialAsset, token))
          : undefined
        if (initialToken) {
          setSelectedToken(initialToken)
          return
        }
      }

      const asset = accountPaymentSettings?.assets.find(asset => isBlockchainAsset(selectedBlockchain, asset))
      if (asset) {
        const initialToken = preparedTokens?.find(token => sameTokenAndAsset(asset, token))
        setSelectedToken(initialToken)
      }
    }
  }, [accountPaymentSettings?.assets, preparedTokens, selectedBlockchain, selectedToken])

  useEffect(() => {
    onUpdate(selectedToken)
  }, [selectedToken, onUpdate])

  return (
    <>
      <PaymentTokensModal
        selectedBlockchain={selectedBlockchain}
        selectedToken={selectedToken}
        tokens={preparedTokens}
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

        {(selectedToken?.balance && selectedTokenAmount !== undefined && BigInt(selectedToken.balance) < selectedTokenAmount) && (
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
                tokenAmount={selectedToken.balance}
                currency={selectedCurrency?.symbol ?? null}
                currencyAmount={selectedToken.balanceCurrency}
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
