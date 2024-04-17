import { useWeb3Modal } from '@web3modal/wagmi/react'
import { FormEvent, useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const ConnectButton: React.FC = () => {
  const { t } = useTranslation()
  const { open } = useWeb3Modal()

  const openHandler = useCallback((e: FormEvent) => {
    e.preventDefault()
    open()
  }, [open])

  return (
    <Button variant="primary" size="lg" onClick={openHandler}>
      {t('components.evm_payment.connect_wallet')}
    </Button>
  )
}

export default ConnectButton
