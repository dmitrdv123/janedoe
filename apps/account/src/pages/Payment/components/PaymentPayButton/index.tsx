import { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, Token, TransactionType } from 'rango-sdk-basic'

import { isBlockchainNativeToken } from '../../../../libs/utils'
import PaymentPayTransferButton from '../PaymentPayTransferButton'
import PaymentPayEvmTokenButton from '../PaymentPayEvmTokenButton'
import PaymentPayEvmNativeButton from '../PaymentPayEvmNativeButton'

interface PaymentPayButtonProps {
  selectedBlockchain: BlockchainMeta | undefined
  selectedToken: Token | undefined
  selectedAddress: string | undefined
  selectedTokenAmount: string | undefined
  onSuccess: (blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => void
}

const PaymentPayButton: React.FC<PaymentPayButtonProps> = (props) => {
  const {selectedBlockchain, selectedToken, selectedAddress, selectedTokenAmount, onSuccess} = props

  const { t } = useTranslation()

  const selectedTokenAmountBigInt = useMemo(() => {
    if (!selectedTokenAmount) {
      return BigInt(0)
    }

    try {
      return BigInt(selectedTokenAmount)
    } catch {
      return BigInt(0)
    }
  }, [selectedTokenAmount])

  return (
    <div className='d-grid'>
      {(!!selectedBlockchain && !!selectedToken && !!selectedAddress && selectedTokenAmountBigInt > BigInt(0) && selectedBlockchain.type === TransactionType.TRANSFER) && (
        <PaymentPayTransferButton
          selectedBlockchain={selectedBlockchain}
          selectedAddress={selectedAddress}
          selectedTokenAmount={selectedTokenAmountBigInt}
          onSuccess={onSuccess}
        />
      )}

      {(!!selectedBlockchain && !!selectedToken && !!selectedAddress && selectedTokenAmountBigInt > BigInt(0) && selectedBlockchain.type === TransactionType.EVM && !isBlockchainNativeToken(selectedBlockchain, selectedToken)) && (
        <PaymentPayEvmTokenButton
          selectedBlockchain={selectedBlockchain}
          selectedToken={selectedToken}
          selectedAddress={selectedAddress}
          selectedTokenAmount={selectedTokenAmountBigInt}
          onSuccess={onSuccess}
        />
      )}

      {(!!selectedBlockchain && !!selectedToken && !!selectedAddress && selectedTokenAmountBigInt > BigInt(0) && selectedBlockchain.type === TransactionType.EVM && isBlockchainNativeToken(selectedBlockchain, selectedToken)) && (
        <PaymentPayEvmNativeButton
          selectedBlockchain={selectedBlockchain}
          selectedAddress={selectedAddress}
          selectedTokenAmount={selectedTokenAmountBigInt}
          onSuccess={onSuccess}
        />
      )}

      {(!selectedBlockchain || !selectedToken || !selectedAddress || selectedTokenAmountBigInt <= BigInt(0) || ![TransactionType.EVM, TransactionType.TRANSFER].includes(selectedBlockchain.type)) && (
        <Button
          variant="primary"
          size="lg"
          disabled
        >
          {t('components.payment.pay_btn')}
        </Button>
      )}
    </div >
  )
}

export default PaymentPayButton
