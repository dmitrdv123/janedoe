import { Modal, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useModalIsOpen } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'

interface PaymentProcessingModalProps {
  data: string | undefined
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = (props) => {
  const { data } = props

  const { t } = useTranslation()
  const modalOpen = useModalIsOpen(ApplicationModal.PAYMENT_PROCESSING)

  return (
    <Modal show={modalOpen} centered size="lg">
      <Modal.Header>
        <Modal.Title>
          {t('components.payment_processing_modal.title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-wrap text-truncate">
        {data}
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
          <span className="visually-hidden">{t('common.processing')}</span>
        </Spinner>
      </Modal.Body>
    </Modal>
  )
}

export default PaymentProcessingModal
