import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'

import BalancesBlockchainEvm from '../BalancesBlockchainEvm'
import BalancesBlockchainTransfer from '../BalancesBlockchainTransfer'

interface BalancesBlockchainProps {
  blockchain: BlockchainMeta
  isDisable: boolean
  isForceRefresh: boolean
  onForceRefreshEnd: () => void
  onProcessing: (isProcessing: boolean) => void
  onSuccess: (hash: string | undefined, message?: string | undefined) => void
}

const BalancesBlockchain: React.FC<BalancesBlockchainProps> = (props) => {
  const { blockchain, isDisable, isForceRefresh, onForceRefreshEnd, onProcessing, onSuccess } = props

  return (
    <>
      {(blockchain.type === TransactionType.EVM) && (
        <BalancesBlockchainEvm
          blockchain={blockchain}
          isDisable={isDisable}
          isForceRefresh={isForceRefresh}
          onForceRefreshEnd={onForceRefreshEnd}
          onProcessing={onProcessing}
          onSuccess={onSuccess}
        />
      )}

      {blockchain.type === TransactionType.TRANSFER && (
        <BalancesBlockchainTransfer
          blockchain={blockchain}
          isDisable={isDisable}
          isForceRefresh={isForceRefresh}
          onForceRefreshEnd={onForceRefreshEnd}
          onProcessing={onProcessing}
          onSuccess={onSuccess}
        />
      )}
    </>
  )
}

export default BalancesBlockchain
