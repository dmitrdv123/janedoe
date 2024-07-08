import { Alert, ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

import { useInfoMessages } from '../../states/application/hook'
import { ServiceError } from '../../types/errors/service-error'
import { PaymentConversionError } from '../../types/errors/payment-conversion-error'
import { convertErrorToMessage, isToken, tokenAmountToCurrency } from '../../libs/utils'
import TokenAmountWithCurrency from '../TokenAmountWithCurrency'
import usePaymentData from '../../libs/hooks/usePaymentData'
import { useExchangeRate, useTokens } from '../../states/settings/hook'
import { useCallback } from 'react'

const InfoMessages: React.FC = () => {
  const { t } = useTranslation()

  const { currency } = usePaymentData()
  const exchangeRate = useExchangeRate()
  const { infoMessages, removeInfoMessage } = useInfoMessages()
  const tokens = useTokens()

  const getServiceError = useCallback((error: ServiceError) => {
    return (
      <>
        {t(error.code, error.args)}{error.message ? `: ${error.message}` : ''}
      </>
    )
  }, [t])

  const getPaymentConversionError = useCallback((error: PaymentConversionError) => {
    const receivedToken = error.data.output?.receivedToken
    const outputToken = receivedToken ?
      tokens?.find(item => isToken(item, receivedToken.blockchain, receivedToken.symbol, receivedToken.address))
      : undefined

    return (
      <>
        {!!error.data.error && (
          <div className="mb-2">
            {error.data.error}
          </div>
        )}

        <div className="mb-2">
          <div>
            {t('components.info_messages.payment_conversion_request_id')}: {error.requestId}
          </div>
          <div>
            {t('components.info_messages.payment_conversion_tx_id')}: {error.txId}
          </div>
        </div>

        {!!(error.data as any).diagnosisUrl && (
          <div className="mb-2">
            <Trans i18nKey="components.info_messages.payment_conversion_diagnosis_url">
              Please follow this <a href={(error.data as any).diagnosisUrl} target='_blank' className='alert-link'>guide</a>.
            </Trans>
          </div>
        )}

        {!!error.data.explorerUrl && (
          <div className="mb-2">
            {t('components.info_messages.payment_conversion_error_explorer_urls')}
            <ListGroup as="ol" numbered>
              {error.data.explorerUrl?.map(
                (item, i) => (
                  <ListGroup.Item as="li" className="border-0 pt-0 pb-0" key={i} variant="danger">
                    <a href={item.url} target='_blank' className='alert-link'>{item.description}</a>
                  </ListGroup.Item>
                )
              )}
            </ListGroup>
          </div>
        )}

        {!!error.data.output && (
          <div>
            {t('components.info_messages.payment_conversion_error_output_details')}
            <ListGroup>
              <ListGroup.Item className="border-0 pt-0 pb-0" variant="danger">
                {error.data.output.type === 'MIDDLE_ASSET_IN_DEST' && (
                  <>
                    {t('components.info_messages.payment_conversion_error_output_details_middle_asset_in_dest')}
                  </>
                )}
                {error.data.output.type === 'MIDDLE_ASSET_IN_SRC' && (
                  <>
                    {t('components.info_messages.payment_conversion_error_output_details_middle_asset_in_src')}
                  </>
                )}
                {error.data.output.type === 'REVERTED_TO_INPUT' && (
                  <>
                    {t('components.info_messages.payment_conversion_error_output_details_reverted_to_input')}
                  </>
                )}
                {error.data.output.type === 'DESIRED_OUTPUT' && (
                  <>
                    {t('components.info_messages.payment_conversion_error_output_details_desired_output')}
                  </>
                )}
              </ListGroup.Item>
              <ListGroup.Item className="border-0 pt-0 pb-0" variant="danger">
                {t('components.info_messages.payment_conversion_error_output_details_amount')} <TokenAmountWithCurrency
                  tokenSymbol={error.data.output.receivedToken.symbol}
                  tokenDecimals={error.data.output.receivedToken.decimals}
                  tokenAmount={error.data.output.amount}
                  currency={currency}
                  currencyAmount={
                    outputToken?.usdPrice && exchangeRate
                      ? tokenAmountToCurrency(error.data.output.amount, outputToken.usdPrice, error.data.output.receivedToken.decimals, exchangeRate)
                      : null
                  } />
              </ListGroup.Item>
            </ListGroup>
          </div>
        )}
      </>
    )
  }, [currency, exchangeRate, t, tokens])

  const getError = useCallback((error: unknown) => {
    return <>{convertErrorToMessage(error, t('common.errors.default'))}</>
  }, [t])

  return (
    <div className='sticky-top'>
      {[...infoMessages]
        .reverse()
        .map(item =>
          <Alert
            key={item.key}
            variant={item.variant ?? 'info'}
            onClose={() => removeInfoMessage(item.key)}
            dismissible
            className='text-wrap text-truncate'
          >
            <div className="mb-2">
              {item.content}
            </div>

            {(!!item.error && (item.error as Error).name === ServiceError.NAME) && (
              <>
                {getServiceError(item.error as ServiceError)}
              </>
            )}

            {(!!item.error && (item.error as Error).name === PaymentConversionError.NAME) && (
              <>
                {getPaymentConversionError(item.error as PaymentConversionError)}
              </>
            )}

            {(!!item.error && (item.error as Error).name !== ServiceError.NAME && (item.error as Error).name !== PaymentConversionError.NAME) && (
              <>
                {getError(item.error)}
              </>
            )}
          </Alert>
        )
      }
    </div>
  )
}

export default InfoMessages
