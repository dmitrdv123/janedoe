import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Spinner } from 'react-bootstrap'

import { useInfoMessages } from '../../../../states/application/hook'
import { Ipn, IpnResult } from '../../../../types/ipn'
import { useAccountNotificationSettings } from '../../../../states/account-settings/hook'
import useApiRequest from '../../../../libs/hooks/useApiRequest'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { INFO_MESSAGE_PAYMENT_HISTORY_SEND_IPN_ERROR } from '../../../../constants'

interface IpnModalButtonProps {
  ipn: Ipn | undefined
  onUpdate: (updatedIpnResult: IpnResult) => void
}

const IpnModalButton: React.FC<IpnModalButtonProps> = (props) => {
  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const notificationSettings = useAccountNotificationSettings()
  const { status: sendIpnStatus, process: sendIpn } = useApiRequest<IpnResult>()

  const { ipn, onUpdate } = props

  const sendIpnHandler = useCallback(async () => {
    removeInfoMessage(INFO_MESSAGE_PAYMENT_HISTORY_SEND_IPN_ERROR)

    if (!ipn) {
      return
    }

    try {
      const updatedIpnResult = await sendIpn(ApiWrapper.instance.sendIpnRequest(
        ipn.paymentId,
        ipn.blockchain,
        ipn.transaction,
        ipn.index
      ))
      if (updatedIpnResult) {
        onUpdate(updatedIpnResult)
      }
    } catch (error) {
      addInfoMessage(t('components.payments.errors.fail_send_notification'), INFO_MESSAGE_PAYMENT_HISTORY_SEND_IPN_ERROR, 'danger')
    }
  }, [t, ipn, onUpdate, sendIpn, addInfoMessage, removeInfoMessage])

  return (
    <div className='mt-3'>
      <Button variant="primary" disabled={sendIpnStatus === 'processing' || !notificationSettings?.callbackUrl} onClick={() => sendIpnHandler()}>
        {t('components.payments.notification_send_btn')}
        {(sendIpnStatus === 'processing') && (
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
            <span className="visually-hidden">{t('common.saving')}</span>
          </Spinner>
        )}
      </Button>

      {!notificationSettings?.callbackUrl && (
        <div className="text-muted">
          {t('components.payments.notification_url_not_set')}
        </div>
      )}

      {(sendIpnStatus === 'error') && (
        <Alert variant='danger' className='mt-3 w-100'>
          {t('components.payments.errors.fail_send_notification')}
        </Alert>
      )}
    </div>
  )
}

export default IpnModalButton
