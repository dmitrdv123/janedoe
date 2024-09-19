import { TransactionType } from 'rango-sdk-basic'

import RefundModalButtonBtc from '../RefundModalButtonBtc'
import RefundModalButtonEvm from '../RefundModalButtonEvm'
import { PaymentHistoryData } from '../../../../types/payment-history'

interface RefundModalButtonProps {
  paymentHistory: PaymentHistoryData | undefined
  refundAddress: string | undefined
  refundAmount: string | undefined
  onSuccess: (paymentHistory: PaymentHistoryData, hash: string | undefined) => void
}

const RefundModalButton: React.FC<RefundModalButtonProps> = (props) => {
  const { paymentHistory, refundAddress, refundAmount, onSuccess } = props

  return (
    <>
      {(paymentHistory?.blockchain?.type === TransactionType.EVM) && (
        <RefundModalButtonEvm paymentHistory={paymentHistory} refundAddress={refundAddress} refundAmount={refundAmount} onSuccess={onSuccess} />
      )}

      {(paymentHistory?.blockchain?.type === TransactionType.TRANSFER) && (
        <RefundModalButtonBtc paymentHistory={paymentHistory} refundAddress={refundAddress} refundAmount={refundAmount} onSuccess={onSuccess} />
      )}
    </>
  )
}

export default RefundModalButton
