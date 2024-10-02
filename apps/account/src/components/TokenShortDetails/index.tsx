import { BlockchainMeta, EVMChainInfo, TransactionType } from 'rango-sdk-basic'

interface TokenShortDetailsProps {
  tokenSymbol: string
  tokenAddress?: string | null
  tokenBlockchain: string
  blockchain: BlockchainMeta | undefined
}

const TokenShortDetails: React.FC<TokenShortDetailsProps> = (props) => {
  const { tokenSymbol, tokenAddress, tokenBlockchain, blockchain } = props

  return (
    <>
      {(!blockchain || blockchain.type !== TransactionType.EVM || !tokenAddress) && (
        <div>
          {tokenSymbol} ({blockchain?.displayName ?? tokenBlockchain})
        </div>
      )}

      {(blockchain?.type === TransactionType.EVM && !!tokenAddress) && (
        <a href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', tokenAddress)} target='_blank' className="text-decoration-none">
          {tokenSymbol} ({blockchain.displayName})
        </a>
      )}
    </>
  )
}

export default TokenShortDetails
