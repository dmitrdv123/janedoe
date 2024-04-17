import { Clipboard } from 'react-bootstrap-icons'
import { BlockchainMeta, EVMChainInfo } from 'rango-sdk-basic'

import { cutString } from '../../libs/utils'
import { BLOCKCHAIN_BTC } from '../../constants'

interface TransactionHashProps {
  blockchain: BlockchainMeta | undefined
  transactionHash: string
}

const TransactionHash: React.FC<TransactionHashProps> = (props) => {
  const { blockchain, transactionHash } = props

  return (
    <>
      {(blockchain?.info?.infoType !== 'EvmMetaInfo' && blockchain?.name.toLocaleLowerCase() !== BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={transactionHash}>
          {cutString(transactionHash)}
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(transactionHash ?? '')}><Clipboard /></button>
        </span>
      )}

      {(blockchain?.name.toLocaleLowerCase() === BLOCKCHAIN_BTC) && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={transactionHash}>
          <a href={`https://www.blockchain.com/explorer/transactions/btc/${transactionHash}`} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={transactionHash}>
            {cutString(transactionHash)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(transactionHash ?? '')}><Clipboard /></button>
        </span>
      )}

      {(blockchain?.info?.infoType === 'EvmMetaInfo') && (
        <span data-bs-toggle="tooltip" data-bs-placement="bottom" title={transactionHash}>
          <a href={(blockchain.info as EVMChainInfo).transactionUrl.replace('{txHash}', transactionHash)} target='_blank' data-bs-toggle="tooltip" data-bs-placement="bottom" title={transactionHash}>
            {cutString(transactionHash)}
          </a>
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={() => navigator.clipboard.writeText(transactionHash ?? '')}><Clipboard /></button>
        </span>
      )}
    </>
  )
}

export default TransactionHash
