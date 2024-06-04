import { BlockchainMeta, EVMChainInfo, Token, TransactionType } from 'rango-sdk-basic'

interface TokenShortDetailsProps {
  blockchain?: BlockchainMeta | undefined
  token: Token
  hideBlockchain?: boolean | undefined
}

const TokenShortDetails: React.FC<TokenShortDetailsProps> = (props) => {
  const { token, blockchain, hideBlockchain } = props

  return (
    <>
      {(blockchain?.type !== TransactionType.EVM || !token.address) && (
        <>
          {token.symbol} {!hideBlockchain && (
            <>
              ({blockchain?.displayName ?? token.blockchain})
            </>
          )}
        </>
      )}

      {(blockchain?.type === TransactionType.EVM && !!token.address) && (
        <a href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', token.address)} target='_blank' className="text-decoration-none">
          {token.symbol} {!hideBlockchain && (
            <>
              ({blockchain.displayName})
            </>
          )}
        </a>
      )}
    </>
  )
}

export default TokenShortDetails
