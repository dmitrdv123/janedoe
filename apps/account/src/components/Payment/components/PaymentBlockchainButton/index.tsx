import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { useToggleModal } from '../../../../states/application/hook'
import { ApplicationModal } from '../../../../types/application-modal'
import PaymentBlockchainsModal from '../PaymentBlockchainsModal'
import { FormEvent, useCallback } from 'react'

interface PaymentBlockchainButtonProps {
  selectedBlockchain: BlockchainMeta | undefined
  blockchains: BlockchainMeta[]
  onUpdate: (blockchain: BlockchainMeta | undefined) => void
}

const PaymentBlockchainButton: React.FC<PaymentBlockchainButtonProps> = (props) => {
  const { selectedBlockchain, blockchains, onUpdate } = props

  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.BLOCKCHAIN_PAYMENT)

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  return (
    <>
      <PaymentBlockchainsModal blockchains={blockchains} onUpdate={onUpdate} />

      <Form.Group>
        <Form.Control as="button" className="dropdown-toggle" onClick={openHandler}>
          {selectedBlockchain?.displayName ?? t('components.payment.select_blockchain')}
        </Form.Control>
        {!selectedBlockchain && (
          <Form.Text className="text-danger">
            {t('components.payment.errors.blockchain_required')}
          </Form.Text>
        )}
      </Form.Group >
    </>
  )
}

export default PaymentBlockchainButton
