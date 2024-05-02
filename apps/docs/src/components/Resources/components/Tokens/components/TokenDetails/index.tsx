import { BlockchainMeta, EVMChainInfo, Token, TransactionType } from 'rango-sdk-basic'
import { Image } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

interface TokenDetailsProps {
  token: Token
  blockchain: BlockchainMeta | undefined
}

const TokenDetails: React.FC<TokenDetailsProps> = (props) => {
  const { token, blockchain } = props

  const { t } = useTranslation()

  return (
    <div className='d-flex align-items-center'>
      {token.image && (
        <Image srcSet={token.image} alt="..." style={{ width: '45px', height: '45px' }} className='me-3' />
      )}
      <div>
        <div className='fw-bold'>{token.symbol}</div>
        <div className='text-muted'>{token.name} ({blockchain?.displayName ?? token.blockchain})</div>
        {((blockchain?.type === TransactionType.EVM || blockchain?.type === TransactionType.TRON) && token.address) && (
          <a href={(blockchain.info as EVMChainInfo).addressUrl.replace('{wallet}', token.address)} target='_blank' className="text-decoration-none">
            {t('common.details')}
          </a>
        )}
      </div>
    </div>
  )
}

export default TokenDetails
