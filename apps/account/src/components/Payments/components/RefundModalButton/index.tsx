import { TransactionType } from 'rango-sdk-basic'

import { RefundResult } from '../../../../types/refund-result'
import RefundModalButtonBtc from '../RefundModalButtonBtc'
import RefundModalButtonEvm from '../RefundModalButtonEvm'
import { PaymentHistoryData } from '../../../../types/payment-history'

interface RefundModalButtonProps {
  paymentHistory: PaymentHistoryData | undefined
  refundAddress: string | undefined
  refundAmount: string | undefined
  onUpdate: (refundResult: RefundResult) => void
}

const RefundModalButton: React.FC<RefundModalButtonProps> = (props) => {
  const { paymentHistory, refundAddress, refundAmount, onUpdate } = props

  return (
    <>
      {(paymentHistory?.blockchain?.type === TransactionType.EVM) && (
        <RefundModalButtonEvm paymentHistory={paymentHistory} refundAddress={refundAddress} refundAmount={refundAmount} onUpdate={onUpdate} />
      )}

      {(paymentHistory?.blockchain?.type === TransactionType.TRANSFER) && (
        <RefundModalButtonBtc paymentHistory={paymentHistory} refundAddress={refundAddress} refundAmount={refundAmount} onUpdate={onUpdate} />
      )}
    </>
  )
}

export default RefundModalButton
