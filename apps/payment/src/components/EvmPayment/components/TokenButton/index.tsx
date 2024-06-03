import { Form } from 'react-bootstrap'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useAccount } from 'wagmi'
import isEqual from 'lodash.isequal'

import { ApplicationModal } from '../../../../types/application-modal'
import { useToggleModal } from '../../../../states/application/hook'
import TokenAmountWithCurrency from '../../../../components/TokenAmountWithCurrency'
import { isBlockchainToken, isToken, tokenAmountToCurrency } from '../../../../libs/utils'
import useWalletDetails from '../../../../libs/hooks/useWalletDetails'
import { useExchangeRate, usePaymentSettings, useTokens } from '../../../../states/settings/hook'
import TokensModal from '../../../modals/TokensModal'
import usePaymentData from '../../../../libs/hooks/usePaymentData'

interface TokenButtonProps {
  blockchain: BlockchainMeta
  token: Token | undefined
  tokenAmount: string | undefined
  disabled?: boolean
  isForceRefresh: boolean
  onForceRefreshEnd: () => void
  onUpdate: (token: Token | undefined) => void
}

const TokenButton: React.FC<TokenButtonProps> = (props) => {
  const { blockchain, token, tokenAmount, disabled, isForceRefresh, onForceRefreshEnd, onUpdate } = props

  const { address } = useAccount()
  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.TOKEN)
  const paymentSettings = usePaymentSettings()
  const { currency } = usePaymentData()
  const exchangeRate = useExchangeRate()
  const tokens = useTokens()
  const { handle: loadWalletDetailsHandler, data: walletDetails } = useWalletDetails(blockchain, address)

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(token)

  const paymentTokens = useMemo(() => {
    if (!tokens) {
      return []
    }

    return tokens.filter(item => item.usdPrice && isBlockchainToken(blockchain, item))
  }, [blockchain, tokens])

  const walletTokenAmount = useMemo(() => {
    if (!token || !walletDetails) {
      return undefined
    }

    return walletDetails.balances?.find(
      item => isToken(token, item.asset.blockchain, item.asset.symbol, item.asset.address)
    )?.amount.amount
  }, [token, walletDetails])

  useEffect(() => {
    setSelectedToken(current => {
      if (current && isBlockchainToken(blockchain, current)) {
        const tokenToUpdate = paymentTokens.find(item => isToken(item, current.blockchain, current.symbol, current.address))
        return isEqual(current, tokenToUpdate)
          ? current
          : tokenToUpdate
      }

      if (paymentSettings) {
        for (const asset of paymentSettings.assets) {
          const tokenToUpdate = paymentTokens.find(item => isToken(item, asset.blockchain, asset.symbol, asset.address))
          if (tokenToUpdate !== undefined) {
            return tokenToUpdate
          }
        }
      }

      return undefined
    })
  }, [blockchain, paymentSettings, paymentTokens])

  useEffect(() => {
    onUpdate(selectedToken)
  }, [selectedToken, onUpdate])

  useEffect(() => {
    if (isForceRefresh) {
      loadWalletDetailsHandler()
      onForceRefreshEnd()
    }
  }, [isForceRefresh, loadWalletDetailsHandler, onForceRefreshEnd])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectTokenHandler = useCallback((tokenToUpdate: Token) => {
    setSelectedToken(tokenToUpdate)
  }, [])

  return (
    <>
      <TokensModal
        blockchain={blockchain}
        selectedToken={selectedToken}
        tokens={paymentTokens}
        onUpdate={selectTokenHandler}
        walletDetails={walletDetails}
      />

      <Form.Group>
        <Form.Control as="button" className="dropdown-toggle" onClick={openHandler} disabled={disabled || paymentTokens.length < 2}>
          {selectedToken?.symbol ?? t('components.evm_payment.select_token')}
        </Form.Control>

        {!selectedToken && (
          <div>
            <Form.Text className="text-danger">
              {t('components.evm_payment.errors.token_required')}
            </Form.Text>
          </div>
        )}

        {(tokenAmount && walletTokenAmount && BigInt(tokenAmount) > BigInt(walletTokenAmount)) && (
          <div>
            <Form.Text className="text-danger">
              {t('components.evm_payment.no_balance')}
            </Form.Text>
          </div>
        )}

        {(!!selectedToken && !!walletTokenAmount) && (
          <div>
            <Form.Text muted>
              {t('common.balance')} <TokenAmountWithCurrency
                tokenSymbol={selectedToken.symbol}
                tokenDecimals={selectedToken.decimals}
                tokenAmount={walletTokenAmount}
                currency={currency}
                currencyAmount={
                  selectedToken.usdPrice && exchangeRate
                    ? tokenAmountToCurrency(walletTokenAmount, selectedToken.usdPrice, selectedToken.decimals, exchangeRate)
                    : null
                }
              />
            </Form.Text>
          </div>
        )}
      </Form.Group>
    </>
  )
}

export default TokenButton
