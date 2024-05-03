import { BlockchainMeta } from 'rango-sdk-basic'
import { useCallback, useEffect, useMemo } from 'react'
import { Alert, Button, Image, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { convertErrorToMessage, findNativeToken } from '../../../../libs/utils'
import { CURRENCY_USD_SYMBOL, INFO_MESSAGE_BALANCE_ERROR } from '../../../../constants'
import { useTokens } from '../../../../states/meta/hook'
import { useInfoMessages } from '../../../../states/application/hook'
import useApiRequestImmediate from '../../../../libs/hooks/useApiRequestImmediate'
import { AccountBlockchainBalance } from '../../../../types/account-blockchain-balance'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { useExchangeRate } from '../../../../states/exchange-rate/hook'
import { useAccountCommonSettings } from '../../../../states/account-settings/hook'
import CurrencyAmount from '../../../CurrencyAmount'
import RbacGuard from '../../../Guards/RbacGuard'
import WithdrawBlockchainTransferButton from '../WithdrawBlockchainTransferButton'

interface BalancesBlockchainTransferProps {
  blockchain: BlockchainMeta
  isDisable: boolean,
  isForceRefresh: boolean
  onForceRefreshEnd: () => void
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined) => void
}

const BalancesBlockchainTransfer: React.FC<BalancesBlockchainTransferProps> = (props) => {
  const { blockchain, isDisable, isForceRefresh, onForceRefreshEnd, onProcessing, onSuccess } = props

  const { t } = useTranslation()
  const tokens = useTokens()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const exchangeRate = useExchangeRate()
  const commonSettings = useAccountCommonSettings()

  const nativeToken = useMemo(() => {
    return tokens ? findNativeToken(blockchain, tokens) : undefined
  }, [blockchain, tokens])

  const {
    status: accountBlockchainBalanceStatus,
    data: accountBlockchainBalanceData,
    error: accountBlockchainBalanceError,
    reprocess: accountBlockchainBalanceRefetch
  } = useApiRequestImmediate<AccountBlockchainBalance>(
    ApiWrapper.instance.accountBlockchainBalanceRequest(blockchain.name)
  )

  useEffect(() => {
    const fetch = async () => {
      await accountBlockchainBalanceRefetch()
      onForceRefreshEnd()
    }

    if (isForceRefresh) {
      fetch()
    }
  }, [accountBlockchainBalanceRefetch, isForceRefresh, onForceRefreshEnd])

  useEffect(() => {
    if (accountBlockchainBalanceError) {
      addInfoMessage(convertErrorToMessage(accountBlockchainBalanceError, t('common.errors.default')), `${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`, 'danger')
    } else {
      removeInfoMessage(`${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`)
    }
  }, [blockchain.name, accountBlockchainBalanceError, t, addInfoMessage, removeInfoMessage])

  const successWithdrawHandler = useCallback((hash: string | undefined) => {
    accountBlockchainBalanceRefetch()
    onSuccess(hash)
  }, [accountBlockchainBalanceRefetch, onSuccess])

  const getTotalAmount = (amount: number, usdPrice: number, exchangeRate: number) => {
    return exchangeRate * usdPrice * amount
  }

  return (
    <tr>
      <td>
        <Image srcSet={blockchain.logo} alt="..." style={{ width: '45px', height: '45px' }} />
        <span className="ms-3">{blockchain.displayName}</span>
      </td>
      <td>
        {accountBlockchainBalanceStatus === 'processing' && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        )}

        {(accountBlockchainBalanceError) && (
          <Alert variant='warning'>
            {t('components.balances.errors.read_balance_error')}
          </Alert>
        )}

        {(accountBlockchainBalanceStatus !== 'processing' && !!accountBlockchainBalanceData && !!nativeToken) && (
          <>
            {accountBlockchainBalanceData.balance} {nativeToken.symbol}
          </>
        )}
      </td>
      <td>
        {(accountBlockchainBalanceStatus !== 'processing' && !!accountBlockchainBalanceData && !!nativeToken?.usdPrice && exchangeRate.current && commonSettings?.currency && commonSettings.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
          <div>
            <CurrencyAmount
              amount={getTotalAmount(accountBlockchainBalanceData.balance, nativeToken.usdPrice, exchangeRate.current.exchangeRate)}
              currency={commonSettings.currency}
            />
          </div>
        )}
        {(accountBlockchainBalanceStatus !== 'processing' && !!accountBlockchainBalanceData && !!nativeToken?.usdPrice) && (
          <div>
            <CurrencyAmount
              amount={getTotalAmount(accountBlockchainBalanceData.balance, nativeToken.usdPrice, 1)}
              currency={CURRENCY_USD_SYMBOL}
            />
          </div>
        )}
      </td>
      <td>
        <div className='d-flex justify-content-end'>
          <RbacGuard requiredKeys={['balances']} requiredPermission='Modify' element={
            <WithdrawBlockchainTransferButton
              blockchain={blockchain}
              isDisable={isDisable || accountBlockchainBalanceStatus === 'processing' || !accountBlockchainBalanceData || accountBlockchainBalanceData.balance <= 0}
              onProcessing={onProcessing}
              onSuccess={successWithdrawHandler}
            />
          } />

          <Button variant="link" className="ms-3" onClick={accountBlockchainBalanceRefetch} disabled={accountBlockchainBalanceStatus === 'processing'}>
            {t('common.refresh_btn')}
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default BalancesBlockchainTransfer
