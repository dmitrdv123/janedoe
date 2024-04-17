import { Clipboard } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo } from 'rango-sdk-basic'

import { cutString } from '../../libs/utils'
import { BLOCKCHAIN_BTC } from '../../constants'

interface TransactionHashProps {
  blockchain: BlockchainMeta | undefined
  transactionHash: string
}

const TransactionHash: React.FC<TransactionHashProps> = (props) => {
  return (
    <>
      {(props.blockchain?.info?.infoType !== 'EvmMetaInfo' && props.blockchain?.name.toLocaleLowerCase() !== BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transactionHash}>
          {cutString(props.transactionHash)}
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.transactionHash ?? '')}><Clipboard /></button>
        </span>
      )}

      {(props.blockchain?.name.toLocaleLowerCase() === BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transactionHash}>
          <a href={`https://www.blockchain.com/explorer/transactions/btc/${props.transactionHash}`} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transactionHash}>
            {cutString(props.transactionHash)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.transactionHash ?? '')}><Clipboard /></button>
        </span>
      )}

      {(props.blockchain?.info?.infoType === 'EvmMetaInfo') && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transactionHash}>
          <a href={(props.blockchain.info as EVMChainInfo).transactionUrl.replace('{txHash}', props.transactionHash)} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.transactionHash}>
            {cutString(props.transactionHash)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(props.transactionHash ?? '')}><Clipboard /></button>
        </span>
      )}
    </>
  )
}

export default TransactionHash
