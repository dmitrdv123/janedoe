import { Form } from 'react-bootstrap'
import { FormEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { ApplicationModal } from '../../../../types/application-modal'
import { useToggleModal } from '../../../../states/application/hook'
import PaymentTokensModal from '../PaymentTokensModal'
import { TokenExt } from '../../../../types/token-ext'
import { AppSettingsCurrency } from '../../../../types/app-settings'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'

interface PaymentTokenButtonProps {
  selectedBlockchain: BlockchainMeta | undefined
  selectedToken: TokenExt | undefined
  selectedTokenAmount: string | undefined
  selectedCurrency: AppSettingsCurrency | undefined
  tokens: TokenExt[]
  onUpdate: (token: TokenExt | undefined) => void
}

const PaymentTokenButton: React.FC<PaymentTokenButtonProps> = (props) => {
  const { selectedBlockchain, selectedToken, selectedCurrency, selectedTokenAmount, tokens, onUpdate } = props

  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.TOKEN_PAYMENT)

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectTokenHandler = useCallback((tokenToUpdate: TokenExt) => {
    onUpdate(tokenToUpdate)
  }, [onUpdate])

  return (
    <>
      <PaymentTokensModal
        selectedBlockchain={selectedBlockchain}
        selectedToken={selectedToken}
        tokens={tokens}
        onUpdate={selectTokenHandler}
      />

      <Form.Group>
        <Form.Control as="button" className="dropdown-toggle" onClick={openHandler}>
          {selectedToken?.symbol ?? t('components.payment.select_token')}
        </Form.Control>

        {!selectedToken && (
          <div>
            <Form.Text className="text-danger">
              {t('components.payment.errors.token_required')}
            </Form.Text>
          </div>
        )}

        {(selectedToken?.balance && selectedTokenAmount && BigInt(selectedToken.balance) < BigInt(selectedTokenAmount)) && (
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
