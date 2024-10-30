import { useMemo, useState } from 'react'
import { Image, Button, Table, Spinner, Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ExclamationCircle } from 'react-bootstrap-icons'
import { Asset, TransactionType } from 'rango-sdk-basic'

import { useBlockchains } from '../../../../states/meta/hook'
import TokenSettings from '../TokenSettings'
import { AccountPaymentSettings } from '../../../../types/account-settings'
import BlockchainSettingsButtons from '../BlockchainSettingsButtons'
import RbacGuard from '../../../../components/Guards/RbacGuard'

interface BlockchainSettingsProps {
  index: number
  blockchain: string
  settings: AccountPaymentSettings
  onUpdate: (accountPaymentSettings: AccountPaymentSettings) => void
  onOpenTokenModal: () => void
}

const BlockchainSettings: React.FC<BlockchainSettingsProps> = (props) => {
  const [showTokens, setShowTokens] = useState<boolean>(false)

  const { t } = useTranslation()
  const blockchains = useBlockchains()

  const { index, blockchain, settings, onUpdate, onOpenTokenModal } = props

  const targetBlockchain = useMemo(() => {
    if (!blockchains) {
      return undefined
    }

    return blockchains.find(item => item.name.toLocaleLowerCase() === blockchain.toLocaleLowerCase())
  }, [blockchains, blockchain])

  const assets = useMemo(() => {
    return settings.assets.filter(item => item.blockchain.toLocaleLowerCase() === blockchain.toLocaleLowerCase())
  }, [settings.assets, blockchain])

  const toggleTokensHandler = () => {
    setShowTokens(val => !val)
  }

  const getAssets = (assetsToShow: Asset[]) => {
    return assetsToShow
      .map((asset, i) => {
        return <TokenSettings
          key={asset.symbol}
          baseIndex={index}
          index={i}
          asset={asset}
          blockchain={targetBlockchain}
          settings={settings}
          onUpdate={onUpdate}
        />
      })
  }

  return (
    <>
      <tr className='border'>
        <td>{index + 1}</td>
        <td>
          {targetBlockchain && (
            <>
              <Image srcSet={targetBlockchain.logo} alt="..." style={{ width: '45px', height: '45px' }} />
              <strong className="ms-3">{targetBlockchain.displayName}</strong>
            </>
          )}

          {!targetBlockchain && (
            <>
              <strong>{blockchain}</strong>
            </>
          )}
        </td>
        <td>
          {(targetBlockchain?.type === TransactionType.EVM) && (
            <>
              <Button variant="link" onClick={() => toggleTokensHandler()}>
                {showTokens ? t('components.payment_settings.hide_tokens_btn') : t('components.payment_settings.show_tokens_btn')}
              </Button>

              {(assets && assets.length === 0) && (
                <span className='text-danger'>
                  <ExclamationCircle /> {t('components.payment_settings.add_tokens_alert')}
                </span>
              )}
            </>
          )}
        </td>
        <td>
          <RbacGuard requiredKeys={['payment_settings']} requiredPermission='Modify' element={
            <BlockchainSettingsButtons
              index={index}
              blockchain={blockchain}
              settings={settings}
              onUpdate={onUpdate}
            />
          } />
        </td>
      </tr>
      {(targetBlockchain?.type === TransactionType.EVM && showTokens) && (
        <tr className='border'>
          <td colSpan={5}>
            <div className='mx-3'>
              {!assets && (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                  <span className="visually-hidden">{t('common.loading')}</span>
                </Spinner>
              )}

              {(assets && assets.length === 0) && (
                <Alert variant="warning">
                  {t('components.payment_settings.add_tokens_alert')}
                </Alert>
              )}

              {(assets && assets.length > 0) && (
                <Table borderless responsive>
                  <thead>
                    <tr className='border'>
                      <th scope="col">{t('components.payment_settings.priority_col')}</th>
                      <th scope="col">{t('components.payment_settings.token_col')}</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAssets(assets)}
                  </tbody>
                </Table>
              )}

              <RbacGuard requiredKeys={['payment_settings']} requiredPermission='Modify' element={
                <Button variant="outline-secondary" onClick={() => onOpenTokenModal()}>
                  {t('components.payment_settings.add_token_btn')}
                </Button>
              } />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default BlockchainSettings
