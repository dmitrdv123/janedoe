import { useCallback } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'
import isEqual from 'lodash.iseual'

import { useToggleModal } from '../../states/application/hook'
import { ApplicationModal } from '../../types/application-modal'
import BlockchainsModal from '../modals/BlockchainsModal'
import { findBlockchainByName } from '../../libs/utils'
import { useAppSettings, useBlockchains, usePaymentSettings } from '../../states/settings/hook'

interface BlockchainButtonProps {
  blockchain: BlockchainMeta | undefined
  disabled?: boolean | undefined
  onUpdate: (blockchain: BlockchainMeta | undefined) => void
}

const BlockchainButton: React.FC<BlockchainButtonProps> = (props) => {
  const { blockchain, disabled, onUpdate } = props

  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainMeta | undefined>(blockchain)

  const { t } = useTranslation()

  const open = useToggleModal(ApplicationModal.BLOCKCHAIN)
  const appSettings = useAppSettings()
  const paymentSettings = usePaymentSettings()
  const blockchains = useBlockchains()

  const paymentBlockchains = useMemo(() => {
    if (!blockchains || !appSettings || !paymentSettings) {
      return []
    }

    return paymentSettings.wallets
      .map(
        item => blockchains.find(blockchain => blockchain.name.toLocaleLowerCase() === item.blockchain.toLocaleLowerCase())
      )
      .filter(paymentBlockchain => {
        if (!paymentBlockchain) {
          return false
        }

        if (paymentBlockchain.type === TransactionType.TRANSFER) {
          const walletAddress = paymentSettings.wallets.find(
            wallet => wallet.blockchain.toLocaleLowerCase() === paymentBlockchain.name.toLocaleLowerCase()
          )?.address
          return !!walletAddress
        }

        return true
      }) as BlockchainMeta[]
  }, [blockchains, appSettings, paymentSettings])

  useEffect(() => {
    setSelectedBlockchain(current => {
      if (current) {
        const blockchainToUpdate = findBlockchainByName(paymentBlockchains, current.name)

        return isEqual(current, blockchainToUpdate)
          ? current
          : blockchainToUpdate
      }

      if (paymentSettings) {
        for (const asset of paymentSettings.assets) {
          const blockchainToUpdate = findBlockchainByName(paymentBlockchains, asset.blockchain)
          if (blockchainToUpdate) {
            return blockchainToUpdate
          }
        }
      }

      return undefined
    })
  }, [paymentBlockchains, paymentSettings])

  useEffect(() => {
    onUpdate(selectedBlockchain)
  }, [selectedBlockchain, onUpdate])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectBlockchainHandler = useCallback(async (blockchainToUpdate: BlockchainMeta) => {
    setSelectedBlockchain(blockchainToUpdate)
  }, [])

  return (
    <>
      <BlockchainsModal
        selectedBlockchain={selectedBlockchain}
        blockchains={paymentBlockchains}
        onUpdate={selectBlockchainHandler}
      />

      <Form.Group>
        <Form.Control as="button" className="dropdown-toggle" disabled={disabled} onClick={openHandler}>
          {selectedBlockchain?.displayName ?? t('components.blockchain_button.select_blockchain')}
        </Form.Control>
        {!selectedBlockchain && (
          <Form.Text className="text-danger">
            {t('components.blockchain_button.errors.blockchain_required')}
          </Form.Text>
        )}
      </Form.Group >
    </>
  )
}

export default BlockchainButton
