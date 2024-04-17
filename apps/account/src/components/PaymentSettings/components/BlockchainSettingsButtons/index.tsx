import { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { ArrowUp, ArrowDown, X } from 'react-bootstrap-icons'

import { AccountPaymentSettings } from '../../../../types/account-settings'

interface BlockchainSettingsButtonsProps {
  index: number
  blockchain: string
  settings: AccountPaymentSettings
  onUpdate: (accountPaymentSettings: AccountPaymentSettings) => void
}

const BlockchainSettingsButtons: React.FC<BlockchainSettingsButtonsProps> = (props) => {
  const { index, blockchain, settings, onUpdate } = props

  const orderUpHandler = useCallback(() => {
    if (index === 0) {
      return
    }

    const blockchains = [...settings.blockchains]
    const temp = blockchains[index - 1]
    blockchains[index - 1] = blockchains[index]
    blockchains[index] = temp

    const assets = [...settings.assets].sort((a, b) => {
      const indexA = blockchains.indexOf(a.blockchain)
      const indexB = blockchains.indexOf(b.blockchain)
      return indexA - indexB
    })

    onUpdate({
      blockchains,
      assets,
    })
  }, [index, settings, onUpdate])

  const orderDownHandler = useCallback(() => {
    if (index === settings.blockchains.length - 1) {
      return
    }

    const blockchains = [...settings.blockchains]
    const temp = blockchains[index + 1]
    blockchains[index + 1] = blockchains[index]
    blockchains[index] = temp

    const assets = [...settings.assets].sort((a, b) => {
      const indexA = blockchains.indexOf(a.blockchain)
      const indexB = blockchains.indexOf(b.blockchain)
      return indexA - indexB
    })

    onUpdate({
      ...settings,
      blockchains,
      assets
    })
  }, [settings, index, onUpdate])

  const removeHandler = useCallback(() => {
    onUpdate({
      blockchains: settings.blockchains.filter(
        item => item.toLocaleLowerCase() !== blockchain.toLocaleLowerCase()
      ),
      assets: settings.assets.filter(
        item => item.blockchain.toLocaleLowerCase() !== blockchain.toLocaleLowerCase()
      )
    })
  }, [blockchain, settings.assets, settings.blockchains, onUpdate])

  return (
    <>
      <div className='d-flex justify-content-end'>
        <div>
          <Button variant="light" disabled={index === 0} onClick={() => orderUpHandler()}>
            <ArrowUp />
          </Button>
          <Button variant="light" disabled={index === settings.blockchains.length - 1} onClick={() => orderDownHandler()}>
            <ArrowDown />
          </Button>
        </div>
        <div className='ms-1'>
          <Button variant="light" onClick={() => removeHandler()}>
            <X />
          </Button>
        </div>
      </div>
    </>
  )
}

export default BlockchainSettingsButtons
