import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta } from 'rango-sdk-basic'

import { useToggleModal } from '../../../../states/application/hook'
import { ApplicationModal } from '../../../../types/application-modal'
import PaymentBlockchainsModal from '../PaymentBlockchainsModal'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useBlockchains } from '../../../../states/meta/hook'
import { useSettings } from '../../../../states/settings/hook'
import { stringComparator } from '../../../../libs/utils'
import { useLocation } from 'react-router-dom'

interface PaymentBlockchainButtonProps {
  onUpdate: (blockchain: BlockchainMeta | undefined) => void
}

const PaymentBlockchainButton: React.FC<PaymentBlockchainButtonProps> = (props) => {
  const { onUpdate } = props

  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainMeta | undefined>(undefined)

  const { t } = useTranslation()
  const location = useLocation()

  const open = useToggleModal(ApplicationModal.BLOCKCHAIN_PAYMENT)
  const blockchains = useBlockchains()
  const appSettings = useSettings()

  const preparedBlockchains = useMemo(() => {
    if (!blockchains) {
      return undefined
    }

    return appSettings.current?.paymentBlockchains
      .map(
        item => blockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase())
      )
      .filter(item => !!item)
      .sort((a, b) => stringComparator((a as BlockchainMeta).displayName, (b as BlockchainMeta).displayName)) as BlockchainMeta[]
  }, [blockchains, appSettings])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectBlockchainHandler = useCallback((blockchainToUpdate: BlockchainMeta) => {
    setSelectedBlockchain(blockchainToUpdate)
  }, [])

  useEffect(() => {
    setSelectedBlockchain(current => {
      if (!preparedBlockchains || preparedBlockchains.length === 0) {
        return undefined
      }

      if (current) {
        return current
      }

      const queryParams = new URLSearchParams(location.search)
      const initialBlockchainName = queryParams.get('blockchain')
      if (initialBlockchainName) {
        const initialBlockchain = preparedBlockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === initialBlockchainName.toLocaleLowerCase())
        if (initialBlockchain) {
          return initialBlockchain
        }
      }

      return preparedBlockchains[0]
    })
  }, [location.search, preparedBlockchains])

  useEffect(() => {
    onUpdate(selectedBlockchain)
  }, [selectedBlockchain, onUpdate])

  return (
    <>
      <PaymentBlockchainsModal blockchains={preparedBlockchains} onUpdate={selectBlockchainHandler} />

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
