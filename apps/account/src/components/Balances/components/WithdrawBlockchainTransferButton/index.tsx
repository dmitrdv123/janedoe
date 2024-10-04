import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { useInfoMessages } from '../../../../states/application/hook'
import { TransactionCreationResult } from '../../../../types/transaction-creation-result'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_BALANCE_WITHDRAW_ERROR } from '../../../../constants'
import { isNullOrEmptyOrWhitespaces } from '../../../../libs/utils'

interface WithdrawBlockchainTransferButtonProps {
  blockchain: BlockchainMeta
  isDisable: boolean
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined, message?: string | undefined) => void
}

const WithdrawBlockchainTransferButton: React.FC<WithdrawBlockchainTransferButtonProps> = (props) => {
  const { blockchain, isDisable, onProcessing, onSuccess } = props

  const { t } = useTranslation()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [withdrawValidated, setWithdrawValidated] = useState(false)
  const [isWithdrawDisabled, setIsWithdrawDisabled] = useState<boolean>(true)

  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const {
    status: withdrawStatus,
    process: withdraw
  } = useApiRequest<TransactionCreationResult>()

  useEffect(() => {
    setIsWithdrawDisabled(isDisable || isNullOrEmptyOrWhitespaces(walletAddress))
  }, [isDisable, walletAddress])

  const withdrawHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity() || isNullOrEmptyOrWhitespaces(walletAddress)) {
      event.stopPropagation()
    } else {
      removeInfoMessage(`${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${blockchain.name}`)

      try {
        onProcessing(true)
        const res = await withdraw(ApiWrapper.instance.withdrawAccountBlockchainRequest(blockchain.name, walletAddress))
        const message = res?.code ? t(res.code, res.args) : undefined

        onSuccess(res?.txId, message)
      } catch (error) {
        addInfoMessage(
          t('components.balances.errors.withdraw_blockchain_error', { blockchain: blockchain.name }),
          `${INFO_MESSAGE_BALANCE_WITHDRAW_ERROR}_${blockchain.name}`,
          'danger',
          error
        )
      } finally {
        onProcessing(false)
      }
    }

    setWithdrawValidated(true)
  }, [t, blockchain, walletAddress, addInfoMessage, onProcessing, onSuccess, removeInfoMessage, withdraw])

  return (
    <Form noValidate validated={withdrawValidated} onSubmit={withdrawHandler} onBlur={(event) => event.currentTarget.checkValidity()}>
      <Row className="align-items-center">
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInput" visuallyHidden>
            Name
          </Form.Label>
          <Form.Control
            className="mb-2"
            placeholder={t('components.balances.wallet_address_placeholder')}
            onChange={event => setWalletAddress(event.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Button variant="primary" className="mb-2" type="submit" disabled={withdrawStatus === 'processing' || isWithdrawDisabled}>
            {t('components.balances.withdraw_all_btn')}
            {(withdrawStatus === 'processing') && (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                <span className="visually-hidden">{t('common.processing')}</span>
              </Spinner>
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default WithdrawBlockchainTransferButton
