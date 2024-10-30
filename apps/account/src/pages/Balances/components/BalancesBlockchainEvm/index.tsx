import { BlockchainMeta } from 'rango-sdk-basic'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner, Image, Table, Button, Alert } from 'react-bootstrap'

import { convertWagmiTransactionErrorToMessage, stringComparator, tokenAmountToCurrency, tokenToUniqueStr } from '../../../../libs/utils'
import { CURRENCY_USD_SYMBOL, INFO_MESSAGE_BALANCE_ERROR } from '../../../../constants'
import { useInfoMessages } from '../../../../states/application/hook'
import { TokenWithBalance } from '../../../../types/token-ext'
import BalancesBlockchainEvmToken from '../BalancesBlockchainEvmToken'
import useReadBalances from '../../../../libs/hooks/useReadBalances'
import { useAccountCommonSettings } from '../../../../states/account-settings/hook'
import { useExchangeRate } from '../../../../states/exchange-rate/hook'
import WithdrawAllButton from '../WithdrawAllButton'
import CurrencyAmount from '../../../../components/CurrencyAmount'
import RbacGuard from '../../../../components/Guards/RbacGuard'

interface BalancesBlockchainEvmProps {
  blockchain: BlockchainMeta
  isDisable: boolean,
  isForceRefresh: boolean
  onForceRefreshEnd: () => void
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined) => void
}

const BalancesBlockchainEvm: React.FC<BalancesBlockchainEvmProps> = (props) => {
  const { blockchain, isDisable, isForceRefresh, onForceRefreshEnd, onProcessing, onSuccess } = props

  const { t } = useTranslation()

  const {
    refetch: balancesRefetch,
    status: balancesStatus,
    error: balancesError,
    tokens: balancesTokens
  } = useReadBalances(blockchain)
  const exchangeRate = useExchangeRate()
  const commonSettings = useAccountCommonSettings()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    if (isForceRefresh) {
      balancesRefetch?.()
      onForceRefreshEnd()
    }
  }, [isForceRefresh, balancesStatus, balancesRefetch, onForceRefreshEnd])

  useEffect(() => {
    if (balancesStatus === 'error') {
      if (balancesError) {
        addInfoMessage(convertWagmiTransactionErrorToMessage(balancesError, t('common.errors.default')), `${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`, 'danger')
      } else {
        addInfoMessage(t('components.balances.errors.transaction_error'), `${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`, 'danger')
      }
    } else {
      removeInfoMessage(`${INFO_MESSAGE_BALANCE_ERROR}_${blockchain.name}`)
    }
  }, [t, blockchain.name, balancesStatus, balancesError, addInfoMessage, removeInfoMessage])

  const successWithdrawHandler = useCallback((hash: string | undefined) => {
    balancesRefetch?.()
    onSuccess(hash)
  }, [balancesRefetch, onSuccess])

  const getTokens = useCallback((tokensToShow: TokenWithBalance[]) => {
    return tokensToShow
      .sort((a, b) => stringComparator(a.symbol, b.symbol))
      .map(token => {
        return <BalancesBlockchainEvmToken
          key={`balances_${tokenToUniqueStr(token)}`}
          blockchain={blockchain}
          token={token}
          balance={token.balance}
          isDisable={isDisable}
          onProcessing={onProcessing}
          onSuccess={successWithdrawHandler}
        />
      })
  }, [blockchain, isDisable, onProcessing, successWithdrawHandler])

  const getTotalAmount = (tokensToShow: TokenWithBalance[], exchangeRate: number) => {
    return tokensToShow.reduce(
      (accumulator, value) => {
        const val = value.usdPrice
          ? tokenAmountToCurrency(value.balance.toString(), value.usdPrice, value.decimals, exchangeRate)
          : 0

        return accumulator + val
      },
      0
    )
  }

  return (
    <tr>
      <td>
        <Image srcSet={blockchain.logo} alt="..." style={{ width: '45px', height: '45px' }} />
        <span className="ms-3">{blockchain.displayName}</span>
      </td>
      <td >
        {(balancesStatus === 'processing') && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        )}

        {(balancesStatus === 'error') && (
          <Alert variant='warning'>
            {t('components.balances.errors.read_balance_error')}
          </Alert>
        )}

        {(balancesStatus === 'success' && !!balancesTokens && balancesTokens.length > 0) && (
          <Table borderless responsive size="sm" className='mb-0'>
            <tbody>
              {getTokens(balancesTokens)}
            </tbody>
          </Table>
        )}
      </td>
      <td>
        {(balancesStatus === 'success' && !!balancesTokens && exchangeRate.current && commonSettings?.currency && commonSettings.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
          <div>
            <CurrencyAmount
              amount={getTotalAmount(balancesTokens, exchangeRate.current.exchangeRate)}
              currency={commonSettings.currency}
            />
          </div>
        )}
        {(balancesStatus === 'success' && !!balancesTokens) && (
          <div>
            <CurrencyAmount
              amount={getTotalAmount(balancesTokens, 1)}
              currency={CURRENCY_USD_SYMBOL}
            />
          </div>
        )}
      </td>
      <td>
        <div className='d-flex justify-content-end'>
          <RbacGuard requiredKeys={['balances']} requiredPermission='Modify' element={
            <WithdrawAllButton
              blockchain={blockchain}
              isDisable={isDisable}
              onProcessing={onProcessing}
              onSuccess={successWithdrawHandler}
            />
          } />

          <Button variant="link" className="ms-3" onClick={balancesRefetch} disabled={balancesStatus === 'processing'}>
            {t('common.refresh_btn')}
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default BalancesBlockchainEvm
