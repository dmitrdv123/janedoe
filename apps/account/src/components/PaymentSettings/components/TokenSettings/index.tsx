import { useMemo } from 'react'
import { Asset, BlockchainMeta } from 'rango-sdk-basic'

import { findToken } from '../../../../libs/utils'
import { useTokens } from '../../../../states/meta/hook'
import { AccountPaymentSettings } from '../../../../types/account-settings'
import RbacGuard from '../../../Guards/RbacGuard'
import TokenSettingsButtons from '../TokenSettingsButtons'
import TokenDetails from '../../../TokenDetails'

interface TokenSettingsProps {
  baseIndex: number
  index: number
  asset: Asset
  blockchain: BlockchainMeta | undefined
  settings: AccountPaymentSettings
  onUpdate: (accountPaymentSettings: AccountPaymentSettings) => void
}

const TokenSettings: React.FC<TokenSettingsProps> = (props) => {
  const tokens = useTokens()

  const { baseIndex, index, asset, blockchain, settings, onUpdate } = props

  const token = useMemo(() => {
    if (!tokens) {
      return undefined
    }

    return findToken(tokens, asset.blockchain, asset.symbol, asset.address)
  }, [asset.address, asset.blockchain, asset.symbol, tokens])

  return (
    <tr className='border'>
      <td>{baseIndex + 1}.{index + 1}</td>
      <td>
        {!!token && (
          <TokenDetails
            tokenSymbol={token.symbol}
            tokenName={token.name}
            tokenAddress={token.address}
            tokenImage={token.image}
            blockchain={blockchain}
          />
        )}

        {!token && (
          <TokenDetails
            tokenSymbol={asset.symbol}
            blockchain={blockchain}
          />
        )}
      </td>
      <td>
        <RbacGuard requiredKeys={['payment_settings']} requiredPermission='Modify' element={
          <TokenSettingsButtons
            index={index}
            asset={asset}
            settings={settings}
            onUpdate={onUpdate}
          />
        } />
      </td>
    </tr>
  )
}

export default TokenSettings
