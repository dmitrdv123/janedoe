import { QRCodeSVG } from 'qrcode.react'
import { BlockchainMeta, Token } from 'rango-sdk-basic'
import { useMemo } from 'react'

import { createPaymentUrlForTransferBlockchains } from '../../../../libs/utils'

interface PayLinkProps {
  blockchain: BlockchainMeta
  token: Token
  address: string
  tokenAmount: string
}

const PayLink: React.FC<PayLinkProps> = (props) => {
  const { blockchain, token, tokenAmount, address } = props

  const paymentUrl = useMemo(() => {
    return createPaymentUrlForTransferBlockchains(blockchain, token, address, tokenAmount)
  }, [blockchain, token, address, tokenAmount])

  return (
    <>
      <QRCodeSVG value={paymentUrl} className="img-fluid" height="100%" width="100%" />
      <a href={paymentUrl} className="text-break" target="_blank" rel="noreferrer">
        {paymentUrl}
      </a>
    </>
  )
}

export default PayLink
