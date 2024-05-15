import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Col, Dropdown, Form, ListGroup, Row, Spinner } from 'react-bootstrap'
import { Asset, BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'
import { useTranslation } from 'react-i18next'
import isEqual from 'lodash.isequal'

import usePaymentConversion from '../../../../libs/hooks/usePaymentConversion'
import { useInfoMessages, useToggleModal } from '../../../../states/application/hook'
import { DEFAULT_SLIPPAGE, INFO_MESSAGE_PAYMENT_CONVERSION_ERROR, SLIPPAGES } from '../../../../constants'
import TokenShortDetails from '../../../../components/TokenShortDetails'
import { useBlockchains, useExchangeRate, usePaymentSettings, useTokens } from '../../../../states/settings/hook'
import TokenAmountWithCurrency from '../../../../components/TokenAmountWithCurrency'
import { findBlockchainByName, isAssetEqualToToken, tokenAmountToCurrency, tryParseFloat } from '../../../../libs/utils'
import usePaymentData from '../../../../libs/hooks/usePaymentData'
import ConversionTokensModal from '../../../modals/ConversionTokensModal'
import { ApplicationModal } from '../../../../types/application-modal'

interface TokenConversionCardProps {
  blockchain: BlockchainMeta
  token: Token
  amount: number
  disabled?: boolean
  onUpdate: (asset: Asset | undefined, amount: string | undefined, slippage: number) => void
}

const TokenConversionCard: React.FC<TokenConversionCardProps> = (props) => {
  const { blockchain, token, amount, disabled, onUpdate } = props

  const tokenRef = useRef<Token>(token)
  const toRef = useRef<Token | undefined>(undefined)
  const amountRef = useRef<number>(amount)
  const slippageRef = useRef<number>(DEFAULT_SLIPPAGE)
  const isProcessingRef = useRef<boolean>(false)

  const [to, setTo] = useState<Token | undefined>(undefined)
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE)
  const [customSlippage, setCustomSlippage] = useState<string>('')

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

    const arr = paymentSettings.assets
      .filter(asset => {
        const blockchain = blockchains?.find(item => item.name.toLocaleLowerCase() === asset.blockchain.toLocaleLowerCase())
        return blockchain?.type === TransactionType.EVM
      })
      .map(asset => tokens.find(token => isAssetEqualToToken(asset, token)))
      .filter(asset => !!asset) as Token[]
    return arr
  }, [paymentSettings, blockchains, tokens])

  const paymentConversionHandler = useCallback(async (from: Token, to: Asset | undefined, amountCurrency: number, slippageToUse: number) => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_CONVERSION_ERROR)

    try {
      onUpdate(undefined, undefined, slippageToUse)
      const result = await paymentConversion(from, to, amountCurrency, slippageToUse)
      onUpdate(result?.quote.to, result?.amount, slippageToUse)
    } catch (error) {
      onUpdate(undefined, undefined, slippageToUse)
      addInfoMessage(t('components.evm_payment.errors.conversion_failed'), INFO_MESSAGE_PAYMENT_CONVERSION_ERROR, 'danger', error)
    }
  }, [t, onUpdate, paymentConversion, addInfoMessage, removeInfoMessage])

  useEffect(() => {
    const process = async () => {
      isProcessingRef.current = true
      tokenRef.current = token
      amountRef.current = amount
      slippageRef.current = slippage
      toRef.current = to

      try {
        await paymentConversionHandler(token, to, amount, slippage)
      } finally {
        isProcessingRef.current = false
      }
    }

    if (isProcessingRef.current && isEqual(tokenRef.current, token) && isEqual(toRef.current, to) && amountRef.current === amount && slippageRef.current === slippage) {
      return
    }

    process()
  }, [token, to, amount, slippage, paymentConversionHandler])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectTokenHandler = useCallback((tokenToUpdate: Token) => {
    setTo(tokenToUpdate)
  }, [])

  const setSlippageHandler = useCallback((value: number) => {
    setSlippage(value)
    setCustomSlippage('')
  }, [])

  const setCustomSlippageHandler = useCallback((value: string) => {
    const num = tryParseFloat(value)

    if (num !== undefined) {
      const predefinedSlippage = SLIPPAGES.find(item => num === item)
      if (predefinedSlippage) {
        setSlippage(predefinedSlippage)
        setCustomSlippage(value)
      } else {
        setSlippage(num)
        setCustomSlippage(value)
      }
    } else {
      setCustomSlippage('')
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
          <div className="d-flex justify-content-between">
            <div>
              <TokenShortDetails blockchain={blockchain} token={token} /> {t('components.evm_payment.conversion_desc')}
            </div>
            <div>
              <Button
                variant="link"
                className="text-decoration-none me-2"
                size='sm'
                disabled={disabled || paymentConversionStatus === 'processing'}
                onClick={() => paymentConversionHandler(token, paymentConversionData?.quote.to, amount, slippage)}
              >
                {t('common.refresh_btn')}
              </Button>
            </div>
          </div>
          <div>
            <Row>
              <Col sm={6}>
                <Form.Group as={Row}>
                  <Form.Label column sm={4}>
                    {t('components.evm_payment.conversion_token')}
                  </Form.Label>
                  <Col sm={8}>
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

                      {(!!paymentConversionData?.quote.to) && (
                        <>
                          {paymentConversionData.quote.to.symbol}&nbsp;({
                            findBlockchainByName(blockchains ?? [], paymentConversionData.quote.to.blockchain)?.displayName ?? paymentConversionData.quote.to.blockchain
                          })
                        </>
                      )}
                    </Button>
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group as={Row}>
                  <Form.Label column sm={8}>
                    {t('components.evm_payment.conversion_slippage')}
                  </Form.Label>
                  <Col sm={4}>
                    {(disabled || paymentConversionStatus === 'processing') && (
                      <Form.Control type="text" value={`${slippage}%`} disabled />
                    )}

                    {(!disabled && paymentConversionStatus !== 'processing') && (
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-link">
                          {slippage}%
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {SLIPPAGES.map(item => (
                            <Dropdown.Item key={`slippage_${item}`} onClick={() => setSlippageHandler(item)} active={slippage === item}>{item}%</Dropdown.Item>
                          ))}
                          <Dropdown.ItemText>
                            <Form.Control type="number" placeholder={t('components.evm_payment.conversion_custom_slippage_placeholder')} value={customSlippage} onChange={e => setCustomSlippageHandler(e.target.value)} />
                          </Dropdown.ItemText>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </Col>
                </Form.Group>
              </Col>
            </Row>
          </div>
          <div className="text-muted">
            {t('components.evm_payment.explain', { token: `${token.symbol}` })}
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
                              {item.swapper.title}: <TokenShortDetails blockchain={findBlockchainByName(blockchains ?? [], item.from.blockchain)} token={item.from} /> {t('components.evm_payment.to')} <TokenShortDetails blockchain={findBlockchainByName(blockchains ?? [], item.to.blockchain)} token={item.to} />
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
