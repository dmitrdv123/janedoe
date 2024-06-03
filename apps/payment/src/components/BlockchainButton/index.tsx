import { useCallback } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { FormEvent, useEffect, useMemo } from 'react'
import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'
import isEqual from 'lodash.isequal'

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
    let blockchainToUpdate: BlockchainMeta | undefined = undefined

    if (blockchain) {
      blockchainToUpdate = findBlockchainByName(paymentBlockchains, blockchain.name)
    }

    if (!blockchainToUpdate && paymentSettings?.assets) {
      for (const asset of paymentSettings.assets) {
        blockchainToUpdate = findBlockchainByName(paymentBlockchains, asset.blockchain)
        if (blockchainToUpdate) {
          break
        }
      }
    }

    if (!isEqual(blockchain, blockchainToUpdate)) {
      onUpdate(blockchainToUpdate)
    }
  }, [blockchain, paymentBlockchains, paymentSettings, onUpdate])

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  const selectBlockchainHandler = useCallback(async (blockchainToUpdate: BlockchainMeta) => {
    onUpdate(blockchainToUpdate)
  }, [onUpdate])

  return (
    <>
      <BlockchainsModal
        selectedBlockchain={blockchain}
        blockchains={paymentBlockchains}
        onUpdate={selectBlockchainHandler}
      />

      <Form.Group>
        <Form.Control as="button" className="dropdown-toggle" disabled={disabled} onClick={openHandler}>
          {blockchain?.displayName ?? t('components.blockchain_button.select_blockchain')}
        </Form.Control>
        {!blockchain && (
          <Form.Text className="text-danger">
            {t('components.blockchain_button.errors.blockchain_required')}
          </Form.Text>
        )}
      </Form.Group >
    </>
  )
}

export default BlockchainButton
