import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, Container, Spinner, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import './index.css'

import { convertTimestampToDate, roundNumber } from '../../libs/utils'
import { useInfoMessages } from '../../states/application/hook'
import { CURRENCY_USD_SYMBOL, DEFAULT_CURRENCY_DECIMAL_PLACES, INFO_MESSAGE_PAYMENT_LOGS_ERROR } from '../../constants'
import TransactionHash from '../../components/TransactionHash'
import SettingsLoader from '../../states/settings/loader'
import usePaymentLogs from '../../libs/hooks/usePaymentLog'
import { PaymentLogData } from '../../types/payment-log'
import WalletAddress from '../../components/WalletAddress'
import TokenDetails from '../../components/TokenDetails'
import TokenAmount from '../../components/TokenAmount'
import CurrencyAmount from '../../components/CurrencyAmount'
import PaymentNavbar from '../../components/PaymentNavbar'
import usePaymentData from '../../libs/hooks/usePaymentData'
import PaymentDataInfo from '../../components/PaymentDataInfo'
import InfoMessages from '../../components/InfoMessages'
import { useBlockchains, useExchangeRate, useTokens } from '../../states/settings/hook'
import { ApiRequestStatus } from '../../types/api-request'

const PaymentStatus: React.FC = () => {
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [paymentLogs, setPaymentLogs] = useState<PaymentLogData[] | undefined>(undefined)
  const isPaymentLogsLoadingRef = useRef(false)

  const { amount } = usePaymentData()
  const { t } = useTranslation()

  const load = usePaymentLogs()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const reload = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_LOGS_ERROR)
    setStatus('processing')

    if (!blockchains || !tokens || !exchangeRate) {
      return
    }

    try {
      isPaymentLogsLoadingRef.current = true
      const result = await load(blockchains, tokens)

      setPaymentLogs(result)
      setStatus('success')
    } catch (error) {
      addInfoMessage(t('pages.payment_status.errors.payment_logs_load_error'), INFO_MESSAGE_PAYMENT_LOGS_ERROR, 'danger', error)
      setStatus('error')
    }
  }, [blockchains, tokens, exchangeRate, t, load, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    if (!isPaymentLogsLoadingRef.current) {
      reload()
    }
  }, [reload])

  const getPaymentLogs = (item: PaymentLogData) => {
    const blockchain = item.blockchain ?? undefined
    const token = item.token ?? undefined

    const dt = convertTimestampToDate(item.timestamp)

    return (
      <tr className='border' key={`payment_${item.paymentId}_${item.blockchain}_${item.transaction}_${item.index}_${item.timestamp}`}>
        <td>
          {dt.toLocaleDateString()} {dt.toLocaleTimeString()}
        </td>
        <td>
          {blockchain?.displayName ?? item.blockchainName}
        </td>
        <td>
          <WalletAddress blockchain={blockchain} address={item.from} />
        </td>
        <td>
          <WalletAddress blockchain={blockchain} address={item.to} />
        </td>
        <td>
          {!!token && (
            <TokenDetails
              tokenSymbol={token.symbol}
              tokenName={token.name}
              tokenAddress={token.address}
              blockchain={blockchain}
            />
          )}

          {!token && (
            <TokenDetails
              tokenSymbol={item.tokenSymbol ?? item.tokenAddress ?? ''}
              tokenAddress={item.tokenAddress}
              blockchain={blockchain}
            />
          )}
        </td>
        <td>
          <TokenAmount
            amount={item.amount}
            symbol={item.tokenSymbol}
            decimals={item.tokenDecimals}
          />

          {(item.amountCurrencyAtPaymentTime && item.currency && item.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
            <div>
              {t('pages.payment_status.at_payment_time')} <CurrencyAmount amount={item.amountCurrencyAtPaymentTime} currency={item.currency} />
            </div>
          )}
          {(item.amountUsdAtPaymentTime) && (
            <div>
              {t('pages.payment_status.at_payment_time')} <CurrencyAmount amount={item.amountUsdAtPaymentTime} currency={CURRENCY_USD_SYMBOL} />
            </div>
          )}

          {(item.amountCurrencyAtCurTime && item.currency && item.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
            <div>
              {t('pages.payment_status.at_cur_time')} <CurrencyAmount amount={item.amountCurrencyAtCurTime} currency={item.currency} />
            </div>
          )}
          {(item.amountUsdAtCurTime) && (
            <div>
              {t('pages.payment_status.at_cur_time')} <CurrencyAmount amount={item.amountUsdAtCurTime} currency={CURRENCY_USD_SYMBOL} />
            </div>
          )}
        </td>
        <td>
          <TransactionHash blockchain={blockchain} transactionHash={item.transaction} />
        </td>
      </tr>
    )
  }

  const isDone = (paymentLogsToUse: PaymentLogData[], amountToUse: number): boolean => {
    const receivedAmount = paymentLogsToUse.reduce(
      (total, item) => total + (item.amountCurrencyAtPaymentTime ?? 0)
      , 0
    )

    return roundNumber(receivedAmount, DEFAULT_CURRENCY_DECIMAL_PLACES) >= amountToUse
  }

  return (
    <>
      <SettingsLoader />

      <PaymentNavbar />

      <main>
        <Container>
          <InfoMessages />

          <div className='mb-2 mt-2'>
            <PaymentDataInfo />
          </div>

          {(status === 'success' && paymentLogs && isDone(paymentLogs, amount)) && (
            <Alert variant="success">
              {t('pages.payment_status.success')}
            </Alert>
          )}

          <div className='mb-2'>
            <Button variant="primary" onClick={() => reload()} disabled={status === 'processing'}>
              {t('common.refresh_btn')}
              {status === 'processing' && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                  <span className="visually-hidden">{t('common.processing')}</span>
                </Spinner>
              )}
            </Button>
          </div>

          <Table bordered responsive size="sm">
            <thead>
              <tr>
                <th>{t('pages.payment_status.table_date')}</th>
                <th>{t('pages.payment_status.table_blockchain')}</th>
                <th>{t('pages.payment_status.table_from')}</th>
                <th>{t('pages.payment_status.table_to')}</th>
                <th>{t('pages.payment_status.table_token')}</th>
                <th>{t('pages.payment_status.table_amount')}</th>
                <th>{t('pages.payment_status.table_transaction')}</th>
              </tr>
            </thead>
            <tbody>
              {(status === 'processing') && (
                <tr>
                  <td colSpan={7}>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                      <span className="visually-hidden">{t('common.loading')}</span>
                    </Spinner>
                  </td>
                </tr>
              )}

              {(status === 'success' && paymentLogs && paymentLogs.length === 0) && (
                <tr>
                  <td colSpan={7}>
                    {t('pages.payment_status.table_no_payments')}
                  </td>
                </tr>
              )}

              {(status === 'success' && paymentLogs && paymentLogs.length > 0) && paymentLogs.map(item => getPaymentLogs(item))}
            </tbody>
          </Table>
        </Container>
      </main>
    </>
  )
}

export default PaymentStatus
