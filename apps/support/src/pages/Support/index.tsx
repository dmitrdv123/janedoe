import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Alert, Button, Container, Form, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import './index.css'

import { useInfoMessages } from '../../states/application/hook'
import { INFO_MESSAGE_SUPPORT_SUBMIT_ERROR } from '../../constants'
import useApiRequest from '../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import { SupportTicket, SupportTicketResult, SupportTicketType } from '../../types/support-ticket'
import AuthNavbar from '../../components/SupportNavbar'

const Support: React.FC = () => {
  const [formValidated, setFormValidated] = useState(true)
  const [done, setDone] = useState(false)

  const [ticketType, setTicketType] = useState<SupportTicketType>('general')
  const [email, setEmail] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [companyId, setCompanyId] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')
  const [blockchain, setBlockchain] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [transaction, setTransaction] = useState<string>('')
  const [desc, setDesc] = useState<string>('')

  const { t } = useTranslation()
  const { search } = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(search)

    const ticketTypeQuery = queryParams.get('type')?.toLocaleLowerCase()
    setTicketType(ticketTypeQuery ? ticketTypeQuery as SupportTicketType : 'general')
    setCompanyId(queryParams.get('id') ?? '')
    setPaymentId(queryParams.get('paymentId') ?? '')
    setFrom(queryParams.get('from') ?? '')
  }, [search])

  const { data: submitResult, status: submitSupportTicketStatus, process: submitSupportTicket } = useApiRequest<SupportTicketResult>()
  const { infoMessages, addInfoMessage, removeInfoMessage } = useInfoMessages()

  const getInfoMessages = useCallback(() => {
    return [...infoMessages]
      .reverse()
      .map(item => {
        return (
          <Alert
            key={item.key}
            variant={item.variant ?? 'info'}
            onClose={() => removeInfoMessage(item.key)}
            dismissible
          >
            {item.content}
          </Alert>
        )
      })
  }, [infoMessages, removeInfoMessage])

  const submitHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
    } else {
      removeInfoMessage(INFO_MESSAGE_SUPPORT_SUBMIT_ERROR)
      try {
        const supportTicket: SupportTicket = ticketType === 'general'
          ? {
            ticketType,
            email,
            desc,
            from: '',
            companyId: '',
            paymentId: '',
            blockchain: '',
            token: '',
            transaction: ''
          }
          : {
            ticketType,
            email,
            from,
            companyId,
            paymentId,
            blockchain,
            token,
            transaction,
            desc
          }

        await submitSupportTicket(ApiWrapper.instance.submitSupportTicket(supportTicket))

        setDone(true)
      } catch (error) {
        addInfoMessage(t('pages.support.errors.fail_submit'), INFO_MESSAGE_SUPPORT_SUBMIT_ERROR, 'danger')
      }
    }

    setFormValidated(true)
  }, [ticketType, email, from, companyId, paymentId, blockchain, token, desc, transaction, t, submitSupportTicket, addInfoMessage, removeInfoMessage])

  return (
    <>
      <AuthNavbar />

      <main>
        <Container className="payment-container">
          {getInfoMessages()}

          <h2>
            {t('pages.support.title')}
          </h2>

          {done && (
            <Alert variant="success">
              <div>
                {t('pages.support.success')}
              </div>
              {submitResult && (
                <div>
                  {t('pages.support.success_ticket_id')} {submitResult.ticketId}
                </div>
              )}
            </Alert>
          )}

          {!done && (
            <Form noValidate validated={formValidated} onSubmit={submitHandler} onBlur={event => event.currentTarget.checkValidity()}>
              <Form.Group className="mb-2" >
                <Form.Label>{t('pages.support.ticket_type')}</Form.Label>
                <Form.Select value={ticketType} onChange={val => setTicketType(val.target.value as SupportTicketType)}>
                  <option value="general">{t('pages.support.ticket_type_general')}</option>
                  <option value="payment">{t('pages.support.ticket_type_payment')}</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2" >
                <Form.Label>{t('pages.support.email')}</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t('pages.support.email_placeholder')}
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  isInvalid={!email || !/^[^\s@]+@[^\s@]+$/.test(email)}
                />
                <Form.Control.Feedback type="invalid">
                  {t('pages.support.email_required')}
                </Form.Control.Feedback>
              </Form.Group>

              {ticketType === 'payment' && (
                <>
                  <Form.Group className="mb-2" >
                    <Form.Label>{t('pages.support.from_wallet')}</Form.Label>
                    <Form.Control type="text" placeholder={t('pages.support.from_wallet_placeholder')} value={from} onChange={event => setFrom(event.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-2" >
                    <Form.Label>{t('pages.support.company_id')}</Form.Label>
                    <Form.Control type="text" placeholder={t('pages.support.company_id_placeholder')} value={companyId} onChange={event => setCompanyId(event.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-2" >
                    <Form.Label>{t('pages.support.payment_id')}</Form.Label>
                    <Form.Control type="text" placeholder={t('pages.support.payment_id_placeholder')} value={paymentId} onChange={event => setPaymentId(event.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-2" >
                    <Form.Label>{t('pages.support.blockchain')}</Form.Label>
                    <Form.Control type="text" placeholder={t('pages.support.blockchain_placeholder')} value={blockchain} onChange={event => setBlockchain(event.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-2" >
                    <Form.Label>{t('pages.support.token')}</Form.Label>
                    <Form.Control type="text" placeholder={t('pages.support.token_placeholder')} value={token} onChange={event => setToken(event.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-2" >
                    <Form.Label>{t('pages.support.transaction')}</Form.Label>
                    <Form.Control type="text" placeholder={t('pages.support.transaction_placeholder')} value={transaction} onChange={event => setTransaction(event.target.value)} />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-2" >
                <Form.Label>{t('pages.support.desc')}</Form.Label>
                <Form.Control as="textarea" rows={5} required value={desc} onChange={event => setDesc(event.target.value)} />
                <Form.Control.Feedback type="invalid">
                  {t('pages.support.desc_required')}
                </Form.Control.Feedback>
              </Form.Group>

              <Button variant="primary" type="submit" disabled={submitSupportTicketStatus === 'processing'}>
                {t('pages.support.submit')}
                {(submitSupportTicketStatus === 'processing') && (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
                    <span className="visually-hidden">{t('common.processing')}</span>
                  </Spinner>
                )}
              </Button>
            </Form>
          )}

        </Container>
      </main>
    </>
  )
}

export default Support
