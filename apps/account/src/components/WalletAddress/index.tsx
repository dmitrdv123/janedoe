import { Clipboard } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo } from 'rango-sdk-basic'
import { cutString } from '../../libs/utils'
import { BLOCKCHAIN_BTC } from '../../constants'

interface WalletAddressProps {
  blockchain: BlockchainMeta | undefined
  address: string | null
}

const WalletAddress: React.FC<WalletAddressProps> = (props) => {
  return (
    <>
      {(!!props.address && props.blockchain?.info?.infoType !== 'EvmMetaInfo' && props.blockchain?.name.toLocaleLowerCase() !== BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.address}>
          {cutString(props.address)} <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.address ?? '')}><Clipboard /></button>
        </span>
      )}

      {(!!props.address && props.blockchain?.name.toLocaleLowerCase() === BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.address}>
          <a href={`https://www.blockchain.com/explorer/addresses/btc/${props.address}`} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.address}>
            {cutString(props.address)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.address ?? '')}><Clipboard /></button>
        </span>
      )}

      {(!!props.address && props.blockchain?.info?.infoType === 'EvmMetaInfo') && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.address}>
          <a href={(props.blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', props.address)} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.address}>
            {cutString(props.address)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.address ?? '')}><Clipboard /></button>
        </span>
      )}
    </>
  )
}

export default WalletAddress
