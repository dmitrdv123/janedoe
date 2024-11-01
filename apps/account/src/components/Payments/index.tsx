import { useCallback, useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import { CheckCircle, ExclamationCircle } from 'react-bootstrap-icons'
import isEqual from 'lodash.isequal'

import { convertErrorToMessage, convertTimestampToDate } from '../../libs/utils'
import { PaymentHistoryData, PaymentHistoryDataFilter, PaymentHistoryDirection } from '../../types/payment-history'
import { useInfoMessages, useToggleModal } from '../../states/application/hook'
import { CURRENCY_USD_SYMBOL, EMPTY_PAYMENT_HISTORY_DATA_FILTER, INFO_MESSAGE_PAYMENT_HISTORY_ERROR } from '../../constants'
import TextWithCopy from './components/TextWithCopy'
import TableFilterDate from './components/TableFilterDate'
import TableFilterBlockchain from './components/TableFilterBlockchain'
import { IpnResult } from '../../types/ipn'
import { ApplicationModal } from '../../types/application-modal'
import IpnModal from './components/IpnModal'
import usePaymentHistory from '../../libs/hooks/usePaymentHistory'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import usePaymentHistoryUpdates from '../../libs/hooks/usePaymentHistoryUpdates'
import TableFilterDetails from './components/TableFilterDetails'
import TableFilterText from './components/TableFilterText'
import TokenShortDetails from '../TokenShortDetails'
import TokenAmount from '../TokenAmount'
import CurrencyAmount from '../CurrencyAmount'
import TransactionHash from '../TransactionHash'
import WalletAddress from '../WalletAddress'

const Payments: React.FC = () => {
  const [paymentHistoryLoadTimestamp, setPaymentHistoryLoadTimestamp] = useState<number>(Math.floor(Date.now() / 1000))
  const [paymentHistoryData, setPaymentHistoryData] = useState<PaymentHistoryData[] | undefined>(undefined)
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState<PaymentHistoryData | undefined>(undefined)
  const [paymentHistoryDataFilter, setPaymentHistoryDataFilter] = useState<PaymentHistoryDataFilter>(EMPTY_PAYMENT_HISTORY_DATA_FILTER)

  const paymentHistoryDataFilterRef = useRef<PaymentHistoryDataFilter>(paymentHistoryDataFilter)
  const observer = useRef<IntersectionObserver>()

  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const openIpnModal = useToggleModal(ApplicationModal.IPN)

  const { process: loadPaymentHistoryAsCsv } = useApiRequest<string[][]>()

  const {
    data: paymentHistory,
    totalSize: paymentHistoryTotalSize,
    status: paymentHistoryStatus,
    error: paymentHistoryError,
    loadNext: loadNextPaymentHistory,
    reload: reloadPaymentHistory
  } = usePaymentHistory(paymentHistoryDataFilter)

  const {
    data: paymentHistoryUpdates
  } = usePaymentHistoryUpdates(paymentHistoryLoadTimestamp)

  useEffect(() => {
    if (paymentHistoryError) {
      addInfoMessage(convertErrorToMessage(paymentHistoryError, t('common.errors.default')), INFO_MESSAGE_PAYMENT_HISTORY_ERROR, 'danger')
    } else {
      removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_ERROR)
    }
  }, [paymentHistoryError, t, addInfoMessage, removeInfoMessage])

  const lastPaymentElementRef = useCallback((node: Element | null) => {
    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadNextPaymentHistory()
      }
    })

    if (node) {
      observer.current?.observe(node)
    }
  }, [loadNextPaymentHistory])

  useEffect(() => {
    setPaymentHistoryData(paymentHistory)
  }, [paymentHistory])

  useEffect(() => {
    if (isEqual(paymentHistoryDataFilter, EMPTY_PAYMENT_HISTORY_DATA_FILTER) && !isEqual(paymentHistoryDataFilterRef.current, EMPTY_PAYMENT_HISTORY_DATA_FILTER)) {
      setPaymentHistoryLoadTimestamp(Math.floor(Date.now() / 1000))
    }

    paymentHistoryDataFilterRef.current = paymentHistoryDataFilter
  }, [paymentHistoryDataFilter])

  const updateIpnResultHandler = useCallback((origPaymentHistory: PaymentHistoryData, updatedIpnResult: IpnResult) => {
    setPaymentHistoryData(
      arr => arr?.map(item => {
        if (item.paymentId.toLocaleLowerCase() === origPaymentHistory.paymentId.toLocaleLowerCase()
          && item.blockchainName.toLocaleLowerCase() === origPaymentHistory.blockchainName.toLocaleLowerCase()
          && item.transaction.toLocaleLowerCase() === origPaymentHistory.transaction.toLocaleLowerCase()
          && item.timestamp === origPaymentHistory.timestamp
          && item.index === origPaymentHistory.index) {
          item.ipnResult = updatedIpnResult
        }

        return item
      })
    )
  }, [])

  const refreshPaymentHistoryHandler = useCallback(() => {
    setPaymentHistoryLoadTimestamp(Math.floor(Date.now() / 1000))
    reloadPaymentHistory()
  }, [reloadPaymentHistory])

  const openIpnModalHandler = useCallback((paymentHistoryToShow: PaymentHistoryData) => {
    setSelectedPaymentHistory(paymentHistoryToShow)
    openIpnModal()
  }, [openIpnModal])

  const clearFiltersHandler = useCallback(() => {
    setPaymentHistoryDataFilter(EMPTY_PAYMENT_HISTORY_DATA_FILTER)
  }, [])

  const timestampFilterHandler = useCallback((filterTimestampFrom: string, filterTimestampTo: string) => {
    setPaymentHistoryDataFilter(filter => ({
      ...filter,
      timestampFrom: filterTimestampFrom,
      timestampTo: filterTimestampTo
    }))
  }, [])

  const blockchainFilterHandler = useCallback((filterBlockchains: string[]) => {
    setPaymentHistoryDataFilter(filter => ({
      ...filter,
      blockchains: filterBlockchains
    }))
  }, [])

  const paymentDetailsFilterHandler = useCallback((filterTransactionHash: string, filterFrom: string, filterTo: string, filterDirection: PaymentHistoryDirection | null) => {
    setPaymentHistoryDataFilter(filter => ({
      ...filter,
      transactionHash: filterTransactionHash,
      from: filterFrom,
      to: filterTo,
      direction: filterDirection
    }))
  }, [])

  const paymentIdFilterHandler = useCallback((filterPaymentId: string) => {
    setPaymentHistoryDataFilter(filter => ({
      ...filter,
      paymentId: filterPaymentId
    }))
  }, [])

  const getPaymentHistory = useCallback((paymentHistoryItem: PaymentHistoryData, last: boolean) => {
    const blockchain = paymentHistoryItem.blockchain ?? undefined
    const token = paymentHistoryItem.token ?? undefined

    const dt = convertTimestampToDate(paymentHistoryItem.timestamp)

    return (
      <tr
        className='border'
        key={`payment_${paymentHistoryItem.paymentId}_${paymentHistoryItem.blockchain?.name}_${paymentHistoryItem.transaction}_${paymentHistoryItem.index}_${paymentHistoryItem.timestamp}`}
        ref={last ? lastPaymentElementRef : null}
      >
        <td>
          {dt.toLocaleDateString()} {dt.toLocaleTimeString()}
        </td>
        <td>
          <div>
            <TextWithCopy value={paymentHistoryItem.paymentId} />
          </div>
          {!!paymentHistoryItem.comment && (
            <div>
              {paymentHistoryItem.comment}
            </div>
          )}
        </td>
        <td>
          {!!token && (
            <TokenShortDetails
              tokenSymbol={token.symbol}
              tokenAddress={token.address}
              tokenBlockchain={token.blockchain}
              blockchain={blockchain}
            />
          )}

          {!token && (
            <TokenShortDetails
              tokenSymbol={paymentHistoryItem.tokenSymbol ?? paymentHistoryItem.tokenAddress ?? ''}
              tokenAddress={paymentHistoryItem.tokenAddress}
              tokenBlockchain={paymentHistoryItem.blockchainName}
              blockchain={blockchain}
            />
          )}
        </td>
        <td>
          <TokenAmount amount={paymentHistoryItem.amount} decimals={paymentHistoryItem.tokenDecimals} symbol={paymentHistoryItem.tokenSymbol} />

          {(paymentHistoryItem.amountCurrencyAtPaymentTime && paymentHistoryItem.currency && paymentHistoryItem.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
            <div>
              {t('components.payments.at_payment_time')} <CurrencyAmount amount={paymentHistoryItem.amountCurrencyAtPaymentTime} currency={paymentHistoryItem.currency} />
            </div>
          )}
          {(paymentHistoryItem.amountUsdAtPaymentTime) && (
            <div>
              {t('components.payments.at_payment_time')} <CurrencyAmount amount={paymentHistoryItem.amountUsdAtPaymentTime} currency={CURRENCY_USD_SYMBOL} />
            </div>
          )}

          {(paymentHistoryItem.amountCurrencyAtCurTime && paymentHistoryItem.currency && paymentHistoryItem.currency.toLocaleLowerCase() !== CURRENCY_USD_SYMBOL) && (
            <div>
              {t('components.payments.at_cur_time')} <CurrencyAmount amount={paymentHistoryItem.amountCurrencyAtCurTime} currency={paymentHistoryItem.currency} />
            </div>
          )}
          {(paymentHistoryItem.amountUsdAtCurTime) && (
            <div>
              {t('components.payments.at_cur_time')} <CurrencyAmount amount={paymentHistoryItem.amountUsdAtCurTime} currency={CURRENCY_USD_SYMBOL} />
            </div>
          )}
        </td>
        <td>
          <div>
            {t('components.payments.tran_hash')} <TransactionHash blockchain={blockchain} transactionHash={paymentHistoryItem.transaction} />
          </div>

          {!!paymentHistoryItem.from && (
            <div>
              {t('components.payments.from')} <WalletAddress blockchain={blockchain} address={paymentHistoryItem.from} />
            </div>
          )}

          <div>
            {t('components.payments.to')} <WalletAddress blockchain={blockchain} address={paymentHistoryItem.to} />
          </div>

          <div>
            {t('components.payments.direction')} {t(`components.payments.${paymentHistoryItem.direction}`)}
          </div>
        </td>
        <td>
          {(!paymentHistoryItem.ipnResult) && (
            <Button variant="secondary-link" onClick={() => openIpnModalHandler(paymentHistoryItem)}>
              {t('components.payments.not_send_btn')}
            </Button>
          )}

          {paymentHistoryItem.ipnResult?.error && (
            <Button variant="secondary-link" onClick={() => openIpnModalHandler(paymentHistoryItem)}>
              <ExclamationCircle className='text-danger me-1' />
              {t('components.payments.error_btn')}
            </Button>
          )}

          {(!paymentHistoryItem.ipnResult?.error && !!paymentHistoryItem.ipnResult?.result) && (
            <Button variant="secondary-link" onClick={() => openIpnModalHandler(paymentHistoryItem)}>
              <CheckCircle className='text-danger me-1' />
              {t('components.payments.success_btn')}
            </Button>
          )}
        </td>
      </tr>
    )
  }, [t, lastPaymentElementRef, openIpnModalHandler])

  return (
    <>
      <h3 className="mb-3">{t('components.payments.title')}</h3>

      <IpnModal paymentHistory={selectedPaymentHistory} onUpdate={updateIpnResultHandler} />

      <div className='mb-3'>
        <Button variant="primary" onClick={refreshPaymentHistoryHandler} disabled={paymentHistoryStatus === 'processing'}>
          {t('common.refresh_btn')}
          {paymentHistoryStatus === 'processing' && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
              <span className="visually-hidden">{t('common.processing')}</span>
            </Spinner>
          )}
        </Button>

        <Button variant="outline-secondary" className='ms-1' disabled={paymentHistoryStatus === 'processing'} onClick={clearFiltersHandler}>
          {t('components.payments.clear_btn')}
        </Button>

        {(!!paymentHistoryTotalSize) && (
          <Button variant="link" className='ms-1' onClick={async () => {
            const csvData = await loadPaymentHistoryAsCsv(
              ApiWrapper.instance.accountPaymentHistoryAsCsvRequest({
                paymentId: paymentHistoryDataFilter.paymentId.trim() ? paymentHistoryDataFilter.paymentId.trim() : undefined,
                timestampFrom: paymentHistoryDataFilter.timestampFrom.trim() ? Number(paymentHistoryDataFilter.timestampFrom) : undefined,
                timestampTo: paymentHistoryDataFilter.timestampTo.trim() ? Number(paymentHistoryDataFilter.timestampTo) : undefined,
                from: paymentHistoryDataFilter.from.trim() ? paymentHistoryDataFilter.from.trim() : undefined,
                to: paymentHistoryDataFilter.to.trim() ? paymentHistoryDataFilter.to.trim() : undefined,
                direction: paymentHistoryDataFilter.direction ? paymentHistoryDataFilter.direction : undefined,
                blockchains: paymentHistoryDataFilter.blockchains.length > 0 ? paymentHistoryDataFilter.blockchains : undefined,
                transaction: paymentHistoryDataFilter.transactionHash.trim() ? paymentHistoryDataFilter.transactionHash.trim() : undefined
              })
            )
            const csvContent = 'data:text/csv;charset=utf-8,' + (csvData ?? []).join("\n")
            const encodedUri = encodeURI(csvContent)
            const link = document.createElement('a')
            link.setAttribute('href', encodedUri)
            link.setAttribute('download', "payment_history.csv")
            document.body.appendChild(link)
            link.click()
          }}>
            {t('components.payments.download_btn', { count: paymentHistoryTotalSize })}
          </Button>
        )}

      </div>

      {!!paymentHistoryUpdates && (
        <Alert variant='primary'>
          {t('components.payments.found_new_records', { count: paymentHistoryUpdates })}
        </Alert>
      )}

      <Table borderless responsive size="sm">
        <thead>
          <tr className='border'>
            <th scope="col">
              {t('components.payments.timestamp_col')}
              <TableFilterDate
                id="payment_history_timestamp"
                from={paymentHistoryDataFilter.timestampFrom}
                to={paymentHistoryDataFilter.timestampTo}
                onChange={timestampFilterHandler}
              />
            </th>
            <th scope="col">
              {t('components.payments.payment_id_col')}
              <TableFilterText
                id="payment_history_payment_id"
                placeholder={t('components.payments.payment_id_placeholder')}
                value={paymentHistoryDataFilter.paymentId}
                onChange={paymentIdFilterHandler}
              />
            </th>
            <th scope="col">
              {t('components.payments.token_col')}
              <TableFilterBlockchain
                id="payment_history_blockchains"
                blockchains={paymentHistoryDataFilter.blockchains}
                onChange={blockchainFilterHandler}
              />
            </th>
            <th scope="col">
              {t('components.payments.amount_col')}
            </th>
            <th scope="col">
              {t('components.payments.details_col')}
              <TableFilterDetails
                id="payment_history_details"
                transactionHash={paymentHistoryDataFilter.transactionHash}
                from={paymentHistoryDataFilter.from}
                to={paymentHistoryDataFilter.to}
                direction={paymentHistoryDataFilter.direction}
                onChange={paymentDetailsFilterHandler}
              />
            </th>
            <th>
              {t('components.payments.notification_col')}
            </th>
          </tr>
        </thead>
        <tbody>
          {(!paymentHistoryData) && (
            <tr>
              <td colSpan={8}>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                  <span className="visually-hidden">{t('common.loading')}</span>
                </Spinner>
              </td>
            </tr>
          )}
          {(!!paymentHistoryData && paymentHistoryData.length === 0) && (
            <tr>
              <td colSpan={8}>
                {t('components.payments.no_payment')}
              </td>
            </tr>
          )}
          {(!!paymentHistoryData && paymentHistoryData.length > 0) && (
            paymentHistoryData.map((item, i) => getPaymentHistory(item, i === paymentHistoryData.length - 1))
          )}
        </tbody>
      </Table>
    </>
  )
}

export default Payments
