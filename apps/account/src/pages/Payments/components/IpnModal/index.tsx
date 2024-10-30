import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Modal } from 'react-bootstrap'

import { useInfoMessages, useModalIsOpen, useToggleModal } from '../../../../states/application/hook'
import { ApplicationModal } from '../../../../types/application-modal'
import { Ipn, IpnResult } from '../../../../types/ipn'
import { PaymentHistoryData } from '../../../../types/payment-history'
import IpnModalButton from '../IpnModalButton'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_PAYMENT_HISTORY_LOAD_IPN_ERROR } from '../../../../constants'
import RbacGuard from '../../../../components/Guards/RbacGuard'

interface IpnModalProps {
  paymentHistory: PaymentHistoryData | undefined
  onUpdate: (origPaymentHistory: PaymentHistoryData, updatedIpnResult: IpnResult) => void
}

const IpnModal: React.FC<IpnModalProps> = (props) => {
  const { t } = useTranslation()
  const modalOpen = useModalIsOpen(ApplicationModal.IPN)
  const toggleModal = useToggleModal(ApplicationModal.IPN)

  const [ipn, setIpn] = useState<Ipn | undefined>(undefined)
  const [ipnResult, setIpnResult] = useState<IpnResult | undefined>(undefined)

  const { process: loadIpn } = useApiRequest<Ipn>()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  useEffect(() => {
    const fetchIpn = async (paymentId: string, blockchain: string, transaction: string, index: number) => {
      removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_LOAD_IPN_ERROR)

      try {
        const result = await loadIpn(ApiWrapper.instance.loadIpnRequest(
          paymentId,
          blockchain,
          transaction,
          index
        ))
        setIpn(result)
      } catch (error) {
        setIpn(undefined)
        addInfoMessage(
          t('components.payments.errors.fail_load_notification'),
          INFO_MESSAGE_PAYMENT_HISTORY_LOAD_IPN_ERROR,
          'danger',
          error
        )
      }
    }

    if (props.paymentHistory) {
      fetchIpn(props.paymentHistory.paymentId, props.paymentHistory.blockchainName, props.paymentHistory.transaction, props.paymentHistory.index)
    }
    setIpnResult(props.paymentHistory?.ipnResult ?? undefined)
  }, [props.paymentHistory, t, loadIpn, addInfoMessage, removeInfoMessage])

  const updateHandler = useCallback((updatedIpnResult: IpnResult) => {
    setIpnResult(updatedIpnResult)

    if (props.paymentHistory) {
      props.onUpdate(props.paymentHistory, updatedIpnResult)
    }
  }, [props])

  const getDate = (ipnResultToShow: IpnResult | undefined, ipnToShow: Ipn | undefined) => {
    if (ipnResultToShow) {
      return new Date(ipnResultToShow.timestamp * 1000).toLocaleString()
    }

    if (ipnToShow) {
      return new Date(ipnToShow.timestamp * 1000).toLocaleString()
    }

    return ''
  }

  const getNotification = (ipnToShow: Ipn | undefined) => {
    if (ipnToShow) {
      return JSON.stringify(ipnToShow, null, 2)
    }

    return ''
  }

  const getResult = (ipnResultToShow: IpnResult | undefined) => {
    if (ipnResultToShow?.error) {
      return ipnResultToShow.error
    }

    if (ipnResultToShow?.result) {
      return JSON.stringify(ipnResultToShow.result, null, 2)
    }

    return ''
  }

  const getStatus = (ipnResultToShow: IpnResult | undefined) => {
    return ipnResultToShow ? ipnResultToShow.status.toString() : ''
  }

  return (
    <Modal show={modalOpen} onHide={toggleModal}>
      <Modal.Header closeButton>
        <Modal.Title>{t('components.payments.notification_status_title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        <Form>
          <Form.Group>
            <Form.Label>{t('components.payments.notification_date_lbl')}</Form.Label>
            <Form.Control type="text" value={getDate(ipnResult, ipn)} readOnly />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('components.payments.notification_notification_lbl')}</Form.Label>
            <Form.Control as="textarea" rows={3} value={getNotification(ipn)} readOnly />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('components.payments.notification_status_code_lbl')}</Form.Label>
            <Form.Control type="text" value={getStatus(ipnResult)} readOnly />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('components.payments.notification_response_lbl')}</Form.Label>
            <Form.Control as="textarea" rows={3} value={getResult(ipnResult)} readOnly />
          </Form.Group>

          <RbacGuard requiredKeys={['payments']} requiredPermission='Modify' element={
            <IpnModalButton
              ipn={ipn}
              onUpdate={updateHandler}
            />
          } />
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default IpnModal
