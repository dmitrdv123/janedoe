import { Clipboard } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo } from 'rango-sdk-basic'

import { cutString } from '../../libs/utils'
import { BLOCKCHAIN_BTC } from '../../constants'

interface TransactionHashProps {
  blockchain: BlockchainMeta | undefined
  transaction: string
}

const TransactionHash: React.FC<TransactionHashProps> = (props) => {
  return (
    <>
      {(props.blockchain?.info?.infoType !== 'EvmMetaInfo' && props.blockchain?.name.toLocaleLowerCase() !== BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transaction}>
          {cutString(props.transaction)}
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.transaction ?? '')}><Clipboard /></button>
        </span>
      )}

      {(props.blockchain?.name.toLocaleLowerCase() === BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transaction}>
          <a href={`https://www.blockchain.com/explorer/transactions/btc/${props.transaction}`} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transaction}>
            {cutString(props.transaction)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.transaction ?? '')}><Clipboard /></button>
        </span>
      )}

      {(props.blockchain?.info?.infoType === 'EvmMetaInfo') && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transaction}>
          <a href={(props.blockchain.info as EVMChainInfo).transactionUrl.replace('{txHash}', props.transaction)} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transaction}>
            {cutString(props.transaction)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.transaction ?? '')}><Clipboard /></button>
        </span>
      )}
    </>
  )
}

export default TransactionHash
