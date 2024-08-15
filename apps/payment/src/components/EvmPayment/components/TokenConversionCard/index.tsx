import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Col, Dropdown, Form, ListGroup, Row, Spinner } from 'react-bootstrap'
import { Asset, BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'
import { useTranslation } from 'react-i18next'

import usePaymentConversion from '../../../../libs/hooks/usePaymentConversion'
import { useInfoMessages, useToggleModal } from '../../../../states/application/hook'
import { INFO_MESSAGE_PAYMENT_CONVERSION_ERROR, SLIPPAGES } from '../../../../constants'
import TokenShortDetails from '../../../TokenShortDetails'
import { useBlockchains, useExchangeRate, usePaymentSettings, useTokens } from '../../../../states/settings/hook'
import TokenAmountWithCurrency from '../../../TokenAmountWithCurrency'
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
  onUpdate: (toToken: Token | undefined, fromTokenAmount: string | undefined, toTokenAmount: string | undefined, slippage: number) => void
}

const TokenConversionCard: React.FC<TokenConversionCardProps> = (props) => {
  const { fromBlockchain, fromToken, toToken, slippage, currencyAmount, disabled, isForceRefresh, onForceRefreshEnd, onUpdate } = props

  const isProcessingRef = useRef<boolean>(false)

  const [toTokenCur, setToTokenCur] = useState<Token | undefined>(toToken)
  const [slippageCur, setSlippageCur] = useState<number>(slippage)
  const [customSlippageCur, setCustomSlippageCur] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

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
    onUpdate(undefined, undefined, undefined, slippageToUse)

    try {
      const result = await paymentConversion(fromTokenToUse, toTokenToUse, currencyAmountToUse, slippageToUse)
      onUpdate(result?.quote.to, result?.amount, result?.quote.outputAmount, slippageToUse)
    } catch (error) {
      addInfoMessage(t('components.evm_payment.errors.conversion_failed'), INFO_MESSAGE_PAYMENT_CONVERSION_ERROR, 'danger', error)
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
        <Card.Header className={isCollapsed ? 'p-2 bg-transparent border-bottom-0' : 'p-2 bg-transparent'}>
          <div className="d-flex justify-content-between">
            <div>
              {t('components.evm_payment.conversion_title')}
              {paymentConversionStatus === 'processing' && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                  <span className="visually-hidden">{t('common.loading')}</span>
                </Spinner>
              )}
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

              <Button
                variant="link"
                className="text-decoration-none me-2"
                size='sm'
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? t('common.expand_btn') : t('common.collapse_btn')}
              </Button>
            </div>
          </div>

          {(!!paymentConversionData) && (
            <div>
              <TokenAmountWithCurrency
                tokenAmount={paymentConversionData.amount}
                tokenSymbol={paymentConversionData.quote.from.symbol}
                tokenDecimals={paymentConversionData.quote.from.decimals}
                currencyAmount={paymentConversionData.quote.from.usdPrice && exchangeRate
                  ? tokenAmountToCurrency(paymentConversionData.amount, paymentConversionData.quote.from.usdPrice, paymentConversionData.quote.from.decimals, exchangeRate)
                  : null
                }
                currency={currency}
              />
              &nbsp;{t('components.evm_payment.to')}
              &nbsp;<TokenAmountWithCurrency
                tokenAmount={paymentConversionData.quote.outputAmount}
                tokenSymbol={paymentConversionData.quote.to.symbol}
                tokenDecimals={paymentConversionData.quote.to.decimals}
                currencyAmount={paymentConversionData.quote.to.usdPrice && exchangeRate
                  ? tokenAmountToCurrency(paymentConversionData.quote.outputAmount, paymentConversionData.quote.to.usdPrice, paymentConversionData.quote.to.decimals, exchangeRate)
                  : null
                }
                currency={currency}
              />
            </div>
          )}

          <div>
            <small className='text-muted'>
              {t('components.evm_payment.explain', { token: `${fromToken.symbol}` })}
            </small>
          </div>
        </Card.Header>
        <Card.Body className={isCollapsed ? 'd-none' : 'p-2'}>
          <Row>
            <Col sm={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  {t('components.evm_payment.conversion_token')}
                </Form.Label>
                <Button
                  className="dropdown-toggle w-100"
                  variant="outline-secondary"
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
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>
                  {t('components.evm_payment.conversion_slippage')}
                </Form.Label>

                {(disabled || paymentConversionStatus === 'processing') && (
                  <Form.Control type="text" value={`${slippageCur}%`} disabled />
                )}

                {(!disabled && paymentConversionStatus !== 'processing') && (
                  <Dropdown className="w-100">
                    <Dropdown.Toggle variant="outline-secondary" className="w-100">
                      {slippageCur}%
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      {SLIPPAGES.map(item => (
                        <Dropdown.Item key={`slippage_${item}`} onClick={() => setSlippageHandler(item)} active={slippageCur === item}>{item}%</Dropdown.Item>
                      ))}
                      <Dropdown.ItemText>
                        <Form.Control type="number" placeholder={t('components.evm_payment.conversion_custom_slippage_placeholder')} value={customSlippageCur} onChange={e => setCustomSlippageHandler(e.target.value)} />
                      </Dropdown.ItemText>
                    </Dropdown.Menu>
                  </Dropdown>
                )}

              </Form.Group>
            </Col>
            <Col sm={8}>
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
                        <div>
                          {t('components.evm_payment.conversion_input_amount')} <TokenAmountWithCurrency
                            tokenSymbol={fromToken.symbol}
                            tokenDecimals={fromToken.decimals}
                            tokenAmount={paymentConversionData.amount}
                            currency={currency}
                            currencyAmount={
                              fromToken.usdPrice && exchangeRate
                                ? tokenAmountToCurrency(paymentConversionData.amount, fromToken.usdPrice, fromToken.decimals, exchangeRate)
                                : null
                            }
                          />
                        </div>
                        <div>
                          {t('components.evm_payment.conversion_output_amount')} <TokenAmountWithCurrency
                            tokenSymbol={paymentConversionData.quote.to.symbol}
                            tokenDecimals={paymentConversionData.quote.to.decimals}
                            tokenAmount={paymentConversionData.quote.outputAmount}
                            currency={currency}
                            currencyAmount={paymentConversionData.quote.outputAmountUsd}
                          />
                        </div>
                        {!!paymentConversionData.quote.estimatedTimeInSeconds && (
                          <div>
                            {t('components.evm_payment.total_duration', { seconds: paymentConversionData.quote.estimatedTimeInSeconds })}
                          </div>
                        )}
                      </div>

                      {(paymentConversionData.quote.fee.length > 0) && (
                        <div className="mb-2">
                          {t('components.evm_payment.fee')}
                          <ListGroup as="ol" numbered>
                            {paymentConversionData.quote.fee.map(
                              (item, i) => (
                                <ListGroup.Item as="li" className="border-0 pt-0 pb-0" key={i}>
                                  {item.name}: <TokenAmountWithCurrency
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
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  )
}

export default TokenConversionCard
