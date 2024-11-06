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
  selectedTokenAmount: bigint | undefined
  disabled: boolean
  onSuccess: (blockchain: BlockchainMeta, hash: string | undefined, message?: string | undefined) => void
}

const PaymentPayButton: React.FC<PaymentPayButtonProps> = (props) => {
  const {selectedBlockchain, selectedToken, selectedAddress, selectedTokenAmount, disabled, onSuccess} = props

  const { t } = useTranslation()

  return (
    <div className='d-grid'>
      {(!!selectedBlockchain && !!selectedToken && !!selectedAddress && selectedTokenAmount !== undefined && selectedBlockchain.type === TransactionType.TRANSFER) && (
        <PaymentPayTransferButton
          selectedBlockchain={selectedBlockchain}
          selectedAddress={selectedAddress}
          selectedTokenAmount={selectedTokenAmount}
          disabled={disabled}
          onSuccess={onSuccess}
        />
      )}

      {(!!selectedBlockchain && !!selectedToken && !!selectedAddress && selectedTokenAmount !== undefined && selectedBlockchain.type === TransactionType.EVM && !isBlockchainNativeToken(selectedBlockchain, selectedToken)) && (
        <PaymentPayEvmTokenButton
          selectedBlockchain={selectedBlockchain}
          selectedToken={selectedToken}
          selectedAddress={selectedAddress}
          selectedTokenAmount={selectedTokenAmount}
          disabled={disabled}
          onSuccess={onSuccess}
        />
      )}

      {(!!selectedBlockchain && !!selectedToken && !!selectedAddress && selectedTokenAmount !== undefined && selectedBlockchain.type === TransactionType.EVM && isBlockchainNativeToken(selectedBlockchain, selectedToken)) && (
        <PaymentPayEvmNativeButton
          selectedBlockchain={selectedBlockchain}
          selectedAddress={selectedAddress}
          selectedTokenAmount={selectedTokenAmount}
          disabled={disabled}
          onSuccess={onSuccess}
        />
      )}

      {(!selectedBlockchain || !selectedToken || !selectedAddress || selectedTokenAmount === undefined || ![TransactionType.EVM, TransactionType.TRANSFER].includes(selectedBlockchain.type)) && (
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
