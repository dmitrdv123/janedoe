import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token } from 'rango-sdk-basic'

import { isBlockchainNativeToken, tokenAmountToCurrency } from '../../../../libs/utils'
import { CURRENCY_USD_SYMBOL } from '../../../../constants'
import { useExchangeRate } from '../../../../states/exchange-rate/hook'
import { useAccountCommonSettings } from '../../../../states/account-settings/hook'
import CurrencyAmount from '../../../CurrencyAmount'
import TokenAmount from '../../../TokenAmount'
import RbacGuard from '../../../Guards/RbacGuard'
import WithdrawEvmNativeTokenButton from '../WithdrawEvmNativeTokenButton'
import WithdrawEvmTokenButton from '../WithdrawEvmTokenButton'
import TokenDetails from '../../../TokenDetails'

interface BalancesBlockchainEvmTokenProps {
  blockchain: BlockchainMeta,
  token: Token,
  balance: bigint,
  isDisable: boolean,
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined) => void
}

const BalancesBlockchainEvmToken: React.FC<BalancesBlockchainEvmTokenProps> = (props) => {
  const { blockchain, token, balance, isDisable, onProcessing, onSuccess } = props

  const { t } = useTranslation()
  const exchangeRate = useExchangeRate()
  const commonSettings = useAccountCommonSettings()

  const getTotalAmount = (amount: string, usdPrice: number, decimals: number, exchangeRate: number) => {
    return tokenAmountToCurrency(amount, usdPrice, decimals, exchangeRate)
  }

  return (
    <tr className='border'>
      <td>
        <TokenDetails
          tokenSymbol={token.symbol}
          tokenName={token.name}
          tokenAddress={token.address}
          tokenImage={token.image}
          blockchain={blockchain}
        />
      </td>
      <td>
        <TokenAmount amount={balance.toString()} decimals={token.decimals} symbol={token.symbol} />

        <div className='text-muted'>
          {(token.usdPrice !== null && exchangeRate.current && commonSettings?.currency && commonSettings.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
            <div>
              <CurrencyAmount
                amount={getTotalAmount(balance.toString(), token.usdPrice, token.decimals, exchangeRate.current.exchangeRate)}
                currency={commonSettings.currency}
              />
            </div>
          )}
          {(token.usdPrice !== null) && (
            <div>
              <CurrencyAmount
                amount={getTotalAmount(balance.toString(), token.usdPrice, token.decimals, 1)}
                currency={CURRENCY_USD_SYMBOL}
              />
            </div>
          )}
          {(token.usdPrice === null) && (
            <Alert variant='warning'>
              {t('components.balances.errors.token_price_error')}
            </Alert>
          )}
        </div>
      </td>
      <td>
        <RbacGuard requiredKeys={['balances']} requiredPermission='Modify' element={
          <>
            {isBlockchainNativeToken(blockchain, token) && (
              <WithdrawEvmNativeTokenButton blockchain={blockchain} amount={balance} isDisable={isDisable} onProcessing={onProcessing} onSuccess={onSuccess} />
            )}
            {!isBlockchainNativeToken(blockchain, token) && (
              <WithdrawEvmTokenButton blockchain={blockchain} token={token} amount={balance} isDisable={isDisable} onProcessing={onProcessing} onSuccess={onSuccess} />
            )}
          </>
        } />
      </td>
    </tr>
  )
}

export default BalancesBlockchainEvmToken
