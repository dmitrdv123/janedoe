import { BlockchainMeta, TransactionType } from 'rango-sdk-basic'

import { RefundResult } from '../../../../types/refund-result'
import RefundModalButtonBtc from '../RefundModalButtonBtc'
import RefundModalButtonEvm from '../RefundModalButtonEvm'

interface RefundModalButtonProps {
  paymentId: string | undefined
  blockchain: BlockchainMeta | undefined
  refundAddress: string | undefined
  refundAmount: string | undefined
  onUpdate: (refundResult: RefundResult) => void
}

const RefundModalButton: React.FC<RefundModalButtonProps> = (props) => {
  const { paymentId, blockchain, refundAddress, refundAmount, onUpdate } = props

  return (
    <>
      {(blockchain?.type === TransactionType.EVM) && (
        <RefundModalButtonEvm paymentId={paymentId} blockchain={blockchain} refundAddress={refundAddress} refundAmount={refundAmount} onUpdate={onUpdate} />
      )}

      {(blockchain?.type === TransactionType.TRANSFER) && (
        <RefundModalButtonBtc paymentId={paymentId} blockchain={blockchain} refundAddress={refundAddress} refundAmount={refundAmount} onUpdate={onUpdate} />
      )}
    </>
  )
}

export default RefundModalButton
