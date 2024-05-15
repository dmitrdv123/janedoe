import { Image } from 'react-bootstrap'
import { BlockchainMeta, EVMChainInfo, TransactionType } from 'rango-sdk-basic'

interface TokenDetailsProps {
  tokenSymbol: string
  tokenName?: string | null
  tokenAddress: string | null
  tokenImage?: string
  blockchain?: BlockchainMeta
}

const TokenDetails: React.FC<TokenDetailsProps> = (props) => {
  const { tokenSymbol, tokenName, tokenAddress, tokenImage, blockchain } = props

  return (
    <>
      {(!blockchain || blockchain.type !== TransactionType.EVM || !tokenAddress) && (
        <div className='d-flex align-items-center'>
          {!!tokenImage && (
            <Image srcSet={tokenImage} alt="..." style={{ width: '45px', height: '45px' }} className='me-3' />
          )}
          <div>
            <div className='fw-bold'>{tokenSymbol}</div>
            {!!tokenName && (
              <div className='text-muted'>{tokenName}</div>
            )}
          </div>
        </div>
      )}

      {(blockchain?.type === TransactionType.EVM && !!tokenAddress) && (
        <a href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', tokenAddress)} target='_blank' className="text-decoration-none">
          <span className='d-flex align-items-center'>
            {!!tokenImage && (
              <Image srcSet={tokenImage} alt="..." style={{ width: '45px', height: '45px' }} className='me-3' />
            )}
            <span>
              <span className='d-block text-body fw-bold'>{tokenSymbol}</span>
              {tokenName && (
                <span className='d-block text-muted'>{tokenName}</span >
              )}
            </span >
          </span>
        </a>
      )}
    </>
  )
}

export default TokenDetails
