import { Clipboard } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo } from 'rango-sdk-basic'
import { cutString } from '../../libs/utils'
import { BLOCKCHAIN_BTC } from '../../constants'

interface WalletAddressProps {
  blockchain: BlockchainMeta | undefined
  address: string | null
}

const WalletAddress: React.FC<WalletAddressProps> = (props) => {
  const { blockchain, address } = props

  return (
    <>
      {(!!address && blockchain?.info?.infoType !== 'EvmMetaInfo' && blockchain?.name.toLocaleLowerCase() !== BLOCKCHAIN_BTC) && (
        <div data-bs-toggle="tooltip" data-bs-placement="bottom" title={address}>
          {cutString(address)} <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(address ?? '')}><Clipboard /></button>
        </div>
      )}

      {(!!address && blockchain?.name.toLocaleLowerCase() === BLOCKCHAIN_BTC) && (
        <div data-bs-toggle="tooltip" data-bs-placement="bottom" title={address}>
          <a href={`https://www.blockchain.com/explorer/addresses/btc/${address}`} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={address}>
            {cutString(address)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(address ?? '')}><Clipboard /></button>
        </div>
      )}

      {(!!address && blockchain?.info?.infoType === 'EvmMetaInfo') && (
        <div data-bs-toggle="tooltip" data-bs-placement="bottom" title={address}>
          <a href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', address)} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={address}>
            {cutString(address)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(address ?? '')}><Clipboard /></button>
        </div>
      )}
    </>
  )
}

export default WalletAddress
