import { useCallback, useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { ArrowUp, ArrowDown, X } from 'react-bootstrap-icons'
import { Asset } from 'rango-sdk-basic'

import { sameAsset } from '../../../../libs/utils'
import { AccountPaymentSettings } from '../../../../types/account-settings'

interface TokenSettingsButtonsProps {
  index: number
  asset: Asset
  settings: AccountPaymentSettings
  onUpdate: (accountPaymentSettings: AccountPaymentSettings) => void
}

const TokenSettingsButtons: React.FC<TokenSettingsButtonsProps> = (props) => {
  const { index, asset, settings, onUpdate } = props

  const blockchainAssets = useMemo(() => {
    return settings.assets.filter(item => item.blockchain.toLocaleLowerCase() === asset.blockchain.toLocaleLowerCase())
  }, [settings.assets, asset])

  const removeHandler = useCallback(() => {
    const arr = [...settings.assets]

    const index = arr.findIndex(item => sameAsset(item, asset))
    if (index === -1) {
      return
    }

    arr.splice(index, 1)

    onUpdate({
      ...settings,
      blockchains: settings.blockchains,
      assets: arr
    })
  }, [settings, asset, onUpdate])

  const orderUpHandler = useCallback(() => {
    const arr = [...settings.assets]

    const index = arr.findIndex(item => sameAsset(item, asset))
    if (index < 1) {
      return
    }

    let prevIndex = -1
    for (let i = index - 1; i >= 0; --i) {
      if (arr[i].blockchain.toLocaleLowerCase() === asset.blockchain.toLocaleLowerCase()) {
        prevIndex = i
        break
      }
    }
    if (prevIndex === -1) {
      return
    }

    const temp = arr[prevIndex]
    arr[prevIndex] = arr[index]
    arr[index] = temp

    onUpdate({
      ...settings,
      blockchains: settings.blockchains,
      assets: arr
    })
  }, [settings, asset, onUpdate])

  const orderDownHandler = useCallback(() => {
    const arr = [...settings.assets]

    const index = arr.findIndex(item => sameAsset(item, asset))
    if (index === -1 || index === arr.length - 1) {
      return
    }

    const nextIndex = arr.findIndex(
      (item, i) => i > index && item.blockchain.toLocaleLowerCase() === asset.blockchain.toLocaleLowerCase()
    )
    if (nextIndex === -1) {
      return
    }

    const temp = arr[nextIndex]
    arr[nextIndex] = arr[index]
    arr[index] = temp

    onUpdate({
      ...settings,
      blockchains: settings.blockchains,
      assets: arr
    })
  }, [settings, asset, onUpdate])

  return (
    <div className='d-flex justify-content-end'>
      <div>
        <Button variant="light" disabled={index === 0} onClick={() => orderUpHandler()}>
          <ArrowUp />
        </Button>
        <Button variant="light" disabled={index === blockchainAssets.length - 1} onClick={() => orderDownHandler()}>
          <ArrowDown />
        </Button>
      </div>
      <div className='ms-1'>
        <Button variant="light" onClick={() => removeHandler()}>
          <X />
        </Button>
      </div>
    </div>
  )
}

export default TokenSettingsButtons
