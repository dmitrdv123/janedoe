import { FormEvent, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner, Button, Form, Alert } from 'react-bootstrap'

import { useInfoMessages } from '../../states/application/hook'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { INFO_MESSAGE_SUPPORT_SUBMIT_ERROR } from '../../constants'
import { SupportAccountTicket, SupportTicketResult, SupportTicketType } from '../../types/support-ticket'

const AccountSupport: React.FC = () => {
  const [formValidated, setFormValidated] = useState(true)
  const [done, setDone] = useState(false)

  const [ticketType, setTicketType] = useState<SupportTicketType>('general')
  const [email, setEmail] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')
  const [blockchain, setBlockchain] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [transaction, setTransaction] = useState<string>('')
  const [desc, setDesc] = useState<string>('')

  const { t } = useTranslation()

  const { data: submitResult, status: submitSupportTicketStatus, process: submitSupportTicket } = useApiRequest<SupportTicketResult>()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const submitHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      removeInfoMessage(INFO_MESSAGE_SUPPORT_SUBMIT_ERROR)
      try {
        const supportTicket: SupportAccountTicket = ticketType === 'general'
          ? {
            ticketType,
            from,
            email,
            desc,
            paymentId: '',
            blockchain: '',
            token: '',
            transaction: ''
          }
          : {
            ticketType,
            from,
            email,
            desc,
            paymentId,
            blockchain,
            token,
            transaction
          }

        await submitSupportTicket(ApiWrapper.instance.submitAccountSupportTicket(supportTicket))

        setDone(true)

        setFrom('')
        setPaymentId('')
        setBlockchain('')
        setToken('')
        setTransaction('')
        setDesc('')
      } catch (error) {
        addInfoMessage(
          t('components.support.errors.fail_submit'),
          INFO_MESSAGE_SUPPORT_SUBMIT_ERROR,
          'danger',
          error
        )
      }
    }

    setFormValidated(true)
  }, [from, email, paymentId, blockchain, token, desc, transaction, ticketType, t, submitSupportTicket, addInfoMessage, removeInfoMessage])

  return (
    <>
      <h3 className="mb-3">{t('components.support.title')}</h3>

      {done && (
        <Alert variant="success">
          <div>
            {t('components.support.success')}
          </div>
          {submitResult && (
            <div>
              {t('components.support.success_ticket_id')} {submitResult.ticketId}
            </div>
          )}
          <Button onClick={() => setDone(false)}>Go back</Button>
        </Alert>
      )}

      {!done && (
        <Form noValidate validated={formValidated} onSubmit={submitHandler} onBlur={event => event.currentTarget.checkValidity()}>
          <Form.Group className="mb-2" >
            <Form.Label>{t('components.support.ticket_type')}</Form.Label>
            <Form.Select value={ticketType} onChange={val => setTicketType(val.target.value as SupportTicketType)}>
              <option value="general">{t('components.support.ticket_type_general')}</option>
              <option value="payment">{t('components.support.ticket_type_payment')}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2" >
            <Form.Label>{t('components.support.email')}</Form.Label>
            <Form.Control type="email" placeholder={t('components.support.email_placeholder')} required value={email} onChange={event => setEmail(event.target.value)} />
            <Form.Control.Feedback type="invalid">
              {t('components.support.email_required')}
            </Form.Control.Feedback>
          </Form.Group>

          {ticketType === 'payment' && (
            <>
              <Form.Group className="mb-2" >
                <Form.Label>{t('components.support.from_wallet')}</Form.Label>
                <Form.Control type="text" placeholder={t('components.support.from_wallet_placeholder')} value={from} onChange={event => setFrom(event.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2" >
                <Form.Label>{t('components.support.payment_id')}</Form.Label>
                <Form.Control type="text" placeholder={t('components.support.payment_id_placeholder')} value={paymentId} onChange={event => setPaymentId(event.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2" >
                <Form.Label>{t('components.support.blockchain')}</Form.Label>
                <Form.Control type="text" placeholder={t('components.support.blockchain_placeholder')} value={blockchain} onChange={event => setBlockchain(event.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2" >
                <Form.Label>{t('components.support.token')}</Form.Label>
                <Form.Control type="text" placeholder={t('components.support.token_placeholder')} value={token} onChange={event => setToken(event.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2" >
                <Form.Label>{t('components.support.transaction')}</Form.Label>
                <Form.Control type="text" placeholder={t('components.support.transaction_placeholder')} value={transaction} onChange={event => setTransaction(event.target.value)} />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-2" >
            <Form.Label>{t('components.support.desc')}</Form.Label>
            <Form.Control as="textarea" rows={5} required value={desc} onChange={event => setDesc(event.target.value)} />
            <Form.Control.Feedback type="invalid">
              {t('components.support.desc_required')}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={submitSupportTicketStatus === 'processing'}>
            {t('components.support.submit')}
            {(submitSupportTicketStatus === 'processing') && (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                <span className="visually-hidden">{t('common.processing')}</span>
              </Spinner>
            )}
          </Button>
        </Form>
      )}
    </>
  )
}

export default AccountSupport
