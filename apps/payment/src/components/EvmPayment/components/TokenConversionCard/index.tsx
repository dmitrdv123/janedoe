import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Col, Dropdown, Form, ListGroup, Row, Spinner } from 'react-bootstrap'
import { Asset, BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'
import { useTranslation } from 'react-i18next'

import usePaymentConversion from '../../../../libs/hooks/usePaymentConversion'
import { useInfoMessages, useToggleModal } from '../../../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_CONVERSION_ERROR, SLIPPAGES } from '../../../../constants'
import TokenShortDetails from '../../../../components/TokenShortDetails'
import { useBlockchains, useExchangeRate, usePaymentSettings, useTokens } from '../../../../states/settings/hook'
import TokenAmountWithCurrency from '../../../../components/TokenAmountWithCurrency'
import { findBlockchainByName, isAssetEqualToToken, tokenAmountToCurrency, tryParseFloat } from '../../../../libs/utils'
import usePaymentData from '../../../../libs/hooks/usePaymentData'
import ConversionTokensModal from '../../../modals/ConversionTokensModal'
import { ApplicationModal } from '../../../../types/application-modal'

interface TokenConversionCardProps {
  fromBlockchain: BlockchainMeta
  fromToken: Token
  toToken: Token | undefined
  slippage: number
  currencyAmount: number
  disabled?: boolean
  isForceRefresh: boolean
  onForceRefreshEnd: () => void
  onUpdate: (token: Token | undefined, tokenAmount: string | undefined, slippage: number) => void
}

const TokenConversionCard: React.FC<TokenConversionCardProps> = (props) => {
  const { fromBlockchain, fromToken, toToken, slippage, currencyAmount, disabled, isForceRefresh, onForceRefreshEnd, onUpdate } = props

  const isProcessingRef = useRef<boolean>(false)

  const [toTokenCur, setToTokenCur] = useState<Token | undefined>(toToken)
  const [slippageCur, setSlippageCur] = useState<number>(slippage)
  const [customSlippageCur, setCustomSlippageCur] = useState<string>('')

  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.CONVERSION_TOKEN)

  const { currency } = usePaymentData()
  const paymentSettings = usePaymentSettings()
  const blockchains = useBlockchains()
  const tokens = useTokens()
  const exchangeRate = useExchangeRate()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const {
    status: paymentConversionStatus,
    data: paymentConversionData,
    process: paymentConversion
  } = usePaymentConversion()

  const conversionTokens = useMemo(() => {
    if (!paymentSettings || !tokens) {
      return []
    }

    return paymentSettings.assets
      .map(asset => {
        if (asset.blockchain.toLocaleLowerCase() !== fromBlockchain.name.toLocaleLowerCase()) {
          return undefined
        }

        const assetBlockchain = blockchains?.find(item => item.name.toLocaleLowerCase() === asset.blockchain.toLocaleLowerCase())
        if (assetBlockchain?.type !== TransactionType.EVM) {
          return undefined
        }

        return tokens.find(token => isAssetEqualToToken(asset, token))
      })
      .filter(asset => !!asset) as Token[]
  }, [paymentSettings, blockchains, fromBlockchain.name, tokens])

  const paymentConversionHandler = useCallback(async (fromTokenToUse: Token, toTokenToUse: Asset | undefined, currencyAmountToUse: number, slippageToUse: number) => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_CONVERSION_ERROR)

    try {
      onUpdate(undefined, undefined, slippageToUse)
      const result = await paymentConversion(fromTokenToUse, toTokenToUse, currencyAmountToUse, slippageToUse)
      onUpdate(result?.quote.to, result?.amount, slippageToUse)
    } catch (error) {
      addInfoMessage(t('components.evm_payment.errors.conversion_failed'), INFO_MESSAGE_PAYMENT_CONVERSION_ERROR, 'danger', error)
      onUpdate(undefined, undefined, slippageToUse)
    }
  }, [t, onUpdate, paymentConversion, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    const process = async () => {
      isProcessingRef.current = true

      try {
        await paymentConversionHandler(fromToken, toTokenCur, currencyAmount, slippageCur)
      } finally {
        onForceRefreshEnd()
        isProcessingRef.current = false
      }
    }

    if (isForceRefresh) {
      process()
    }
  }, [currencyAmount, isForceRefresh, slippageCur, fromToken, toTokenCur, onForceRefreshEnd, paymentConversionHandler])

  useEffect(() => {
    const process = async () => {
      if (isProcessingRef.current) {
        return
      }
      isProcessingRef.current = true

      try {
        await paymentConversionHandler(fromToken, toTokenCur, currencyAmount, slippageCur)
      } finally {
        isProcessingRef.current = false
      }
    }

    process()
  }, [currencyAmount, slippageCur, fromToken, toTokenCur, onForceRefreshEnd, paymentConversionHandler])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectTokenHandler = useCallback((tokenToUpdate: Token) => {
    setToTokenCur(tokenToUpdate)
  }, [])

  const setSlippageHandler = useCallback((value: number) => {
    setSlippageCur(value)
    setCustomSlippageCur('')
  }, [])

  const setCustomSlippageHandler = useCallback((value: string) => {
    const num = tryParseFloat(value)

    if (num !== undefined) {
      const predefinedSlippage = SLIPPAGES.find(item => num === item)
      if (predefinedSlippage) {
        setSlippageCur(predefinedSlippage)
        setCustomSlippageCur(value)
      } else {
        setSlippageCur(num)
        setCustomSlippageCur(value)
      }
    } else {
      setCustomSlippageCur('')
    }
  }, [])

  return (
    <>
      <ConversionTokensModal
        selectedToken={paymentConversionData?.quote.to}
        tokens={conversionTokens}
        onUpdate={selectTokenHandler}
      />

      <Card>
        <Card.Header className='p-2'>
          <div>
            <div className="d-flex justify-content-between">
              <div>
                <Row>
                  <Col xs="auto">
                    <Form.Group as={Row}>
                      <Form.Label column xs="auto">
                        {t('components.evm_payment.conversion_token')}
                      </Form.Label>
                      <Col xs="auto">
                        <Button
                          className="dropdown-toggle"
                          variant="outline-link"
                          disabled={disabled || paymentConversionStatus === 'processing'}
                          onClick={openHandler}
                        >
                          {(!paymentConversionData?.quote.to) && (
                            <>
                              {t('components.evm_payment.conversion_select_token')}
                            </>
                          )}

                          {(!!paymentConversionData?.quote.to) && (paymentConversionData.quote.to.symbol)}
                        </Button>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col xs="auto">
                    <Form.Group as={Row}>
                      <Form.Label column xs="auto">
                        {t('components.evm_payment.conversion_slippage')}
                      </Form.Label>
                      <Col xs="auto">
                        {(disabled || paymentConversionStatus === 'processing') && (
                          <Form.Control type="text" value={`${slippageCur}%`} disabled />
                        )}

                        {(!disabled && paymentConversionStatus !== 'processing') && (
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-link">
                              {slippageCur}%
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {SLIPPAGES.map(item => (
                                <Dropdown.Item key={`slippage_${item}`} onClick={() => setSlippageHandler(item)} active={slippageCur === item}>{item}%</Dropdown.Item>
                              ))}
                              <Dropdown.ItemText>
                                <Form.Control type="number" placeholder={t('components.evm_payment.conversion_custom_slippage_placeholder')} value={customSlippageCur} onChange={e => setCustomSlippageHandler(e.target.value)} />
                              </Dropdown.ItemText>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <div>
                <Button
                  variant="link"
                  className="text-decoration-none me-2"
                  size='sm'
                  disabled={disabled || paymentConversionStatus === 'processing'}
                  onClick={() => paymentConversionHandler(fromToken, paymentConversionData?.quote.to, currencyAmount, slippageCur)}
                >
                  {t('common.refresh_btn')}
                </Button>
              </div>
            </div>
          </div>
          <div className="text-muted">
            {t('components.evm_payment.explain', { token: `${fromToken.symbol}` })}
          </div>
        </Card.Header>
        <Card.Body className='p-2'>
          {paymentConversionStatus === 'processing' && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
              <span className="visually-hidden">{t('common.loading')}</span>
            </Spinner>
          )}

          {paymentConversionStatus === 'error' && (
            <Alert variant='warning' className='mb-0'>
              {t('components.evm_payment.conversion_error_alert')}
            </Alert>
          )}

          {paymentConversionStatus === 'success' && (
            <>
              {!paymentConversionData && (
                <Alert variant='warning' className='mb-0'>
                  {t('components.evm_payment.conversion_not_found_alert')}
                </Alert>
              )}

              {!!paymentConversionData && (
                <>
                  <div className="mb-2">
                    {!!paymentConversionData.quote.estimatedTimeInSeconds && (
                      <>
                        {t('components.evm_payment.total_duration', { seconds: paymentConversionData.quote.estimatedTimeInSeconds })}
                      </>
                    )}
                  </div>

                  {(paymentConversionData.quote.fee.length > 0) && (
                    <div className="mb-2">
                      {t('components.evm_payment.fee')}
                      <ListGroup as="ol" numbered>
                        {paymentConversionData.quote.fee.map(
                          (item, i) => (
                            <ListGroup.Item as="li" className="border-0 pt-0 pb-0" key={i}>
                              {item.name} <TokenAmountWithCurrency
                                tokenSymbol={item.token.symbol}
                                tokenDecimals={item.token.decimals}
                                tokenAmount={item.amount}
                                currency={currency}
                                currencyAmount={
                                  item.token.usdPrice && exchangeRate
                                    ? tokenAmountToCurrency(item.amount, item.token.usdPrice, item.token.decimals, exchangeRate)
                                    : null
                                }
                              />
                            </ListGroup.Item>
                          )
                        )}
                      </ListGroup>
                    </div>
                  )}

                  {(!!paymentConversionData.quote.path && paymentConversionData.quote.path.length > 0) && (
                    <div className="mb-2">
                      {t('components.evm_payment.conversion')}
                      <ListGroup as="ol" numbered>
                        {paymentConversionData.quote.path.map(
                          (item, i) => (
                            <ListGroup.Item as="li" className="border-0 pt-0 pb-0" key={i}>
                              {item.swapper.title}: <TokenShortDetails token={item.from} hideBlockchain={true} /> {t('components.evm_payment.to')} <TokenShortDetails blockchain={findBlockchainByName(blockchains ?? [], item.to.blockchain)} token={item.to} />
                            </ListGroup.Item>
                          )
                        )}
                      </ListGroup>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default TokenConversionCard
