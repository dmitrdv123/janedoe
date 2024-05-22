import React from 'react'
import { Alert, Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import './index.css'

import SettingsLoader from '../../states/settings/loader'
import PaymentNavbar from '../../components/PaymentNavbar'
import usePaymentData from '../../libs/hooks/usePaymentData'
import PaymentSummary from '../../components/PaymentSummary'
import InfoMessages from '../../components/InfoMessages'

const PaymentStatus: React.FC = () => {
  const { t } = useTranslation()

  const { id, paymentId, currency, amount } = usePaymentData()

  return (
    <>
      <SettingsLoader />

      <PaymentNavbar />

      <main>
        <Container>
        <InfoMessages />

          <div className='mb-2 mt-2'>
            <PaymentSummary />
          </div>

          <Alert variant="success">
            {t('pages.payment_success.success_desc')}&nbsp;
            <a href={`/status/${id}/${paymentId}/${currency}/${amount}`}>
              {t('pages.payment_success.link_details')}
            </a>
          </Alert>
        </Container>
      </main>
    </>
  )
}

export default PaymentStatus
