import { useMemo } from 'react'
import { NavDropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAccount, useDisconnect } from 'wagmi'

import { cutString } from '../../../../libs/utils'
import { useBlockchains } from '../../../../states/meta/hook'

export interface WalletDropdownProps {
  address: string
}

const WalletDropdown: React.FC<WalletDropdownProps> = (props) => {
  const { address } = props

  const { t } = useTranslation()
  const { chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const blockchains = useBlockchains()

  const blockchain = useMemo(() => {
    if (chainId === undefined) {
      return undefined
    }

    const hexChainId = `0x${chainId.toString(16)}`
    return blockchains?.find(item => item.chainId === hexChainId)
  }, [chainId, blockchains])

  return (
    <NavDropdown
      title={t('components.navbar.connected_in', { address: cutString(address.toString()), blockchain: blockchain?.displayName ?? '' })}
      align='end'
    >
      <NavDropdown.Header>
        {address} {blockchain?.displayName}
      </NavDropdown.Header>
      <NavDropdown.Item as='button' onClick={() => disconnect()}>
        {t('components.navbar.disconnect')}
      </NavDropdown.Item>
    </NavDropdown>
  )
}

export default WalletDropdown
