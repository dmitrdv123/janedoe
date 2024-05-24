import { useMemo } from 'react'
import { ListGroup, Modal, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { useModalIsOpen } from '../../../states/application/hook'
import { ApplicationModal } from '../../../types/application-modal'
import { CheckCircle, ExclamationCircle } from 'react-bootstrap-icons'
import { ApiRequestStatus } from '../../../types/api-request'

interface PaymentProcessingModalProps {
  stages: string[]
  status: ApiRequestStatus
  stage: string | undefined
  details: string | undefined
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = (props) => {
  const { stages, stage, status, details } = props

  const { t } = useTranslation()
  const modalOpen = useModalIsOpen(ApplicationModal.PAYMENT_PROCESSING)

  const stageIndex = useMemo(() => {
    return stages.findIndex(item => item === stage)
  }, [stages, stage])

  return (
    <Modal show={modalOpen} centered size="lg">
      <Modal.Header>
        <Modal.Title>
          {t('components.payment_processing_modal.title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-wrap text-truncate">
        <ListGroup numbered={stages.length > 1}>
          {stages.length === 0 && (
            <ListGroup.Item className="d-flex justify-content-between align-items-start border-0">
              <div className="ms-2 me-auto">
                <div>Waiting payment processing</div>
              </div>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                <span className="visually-hidden">{t('common.processing')}</span>
              </Spinner>
            </ListGroup.Item>
          )}

          {stages.length > 0 && stages.map((item, i) => (
            <ListGroup.Item
              className="d-flex justify-content-between align-items-start border-0"
              active={stages.length > 1 && i === stageIndex}
              key={item}
            >
              <div className="ms-2 me-auto">
                <div>{t(item)}</div>

                {(i === stageIndex && !!details) && (
                  <small>{details}</small>
                )}
              </div>

              {(i < stageIndex) && (
                <CheckCircle />
              )}

              {(i === stageIndex) && (
                <>
                  {status === 'processing' && (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                      <span className="visually-hidden">{t('common.processing')}</span>
                    </Spinner>
                  )}
                  {status === 'error' && (
                    <ExclamationCircle />
                  )}
                  {status === 'success' && (
                    <CheckCircle />
                  )}
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  )
}

export default PaymentProcessingModal
