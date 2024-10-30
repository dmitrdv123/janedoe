import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner, Button, Table, Form, Alert } from 'react-bootstrap'
import isEqual from 'lodash.isequal'
import { BlockchainMeta } from 'rango-sdk-basic'

import { assertAccountPaymentSettings } from '../../libs/utils'
import { useInfoMessages, useToggleModal } from '../../states/application/hook'
import { ApplicationModal } from '../../types/application-modal'
import { useAccountPaymentSettings, useAccountRbacSettings, useUpdateAccountPaymentSettingsCallback } from '../../states/account-settings/hook'
import { INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR, INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_SAVING_ERROR } from '../../constants'
import { AccountPaymentSettings } from '../../types/account-settings'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'
import BlockchainSettings from './components/BlockchainSettings'
import { useBlockchains } from '../../states/meta/hook'
import RbacGuard from '../Guards/RbacGuard'
import BlockchainsModal from '../modals/BlockchainsModal'
import TokensModal from '../modals/TokensModal'

const PaymentSettings: React.FC = () => {
  const { t } = useTranslation()
  const accountPaymentSettings = useAccountPaymentSettings()
  const blockchains = useBlockchains()

  const openBlockchainModal = useToggleModal(ApplicationModal.BLOCKCHAIN)
  const openTokenModal = useToggleModal(ApplicationModal.TOKEN)
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()
  const updateAccountPaymentSettings = useUpdateAccountPaymentSettingsCallback()
  const rbacSettings = useAccountRbacSettings()

  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainMeta | undefined>(undefined)
  const [validated, setValidated] = useState(true)
  const [currentAccountPaymentSettings, setCurrentAccountPaymentSettings] = useState<AccountPaymentSettings | undefined>(undefined)
  const [isSaveEnabled, setIsSaveEnabled] = useState(false)

  const { status: loadAccountDefaultPaymentSettingsStatus, process: loadAccountDefaultPaymentSettings } = useApiRequest<AccountPaymentSettings>()
  const { status: saveAccountPaymentSettingsStatus, process: saveAccountPaymentSettings } = useApiRequest<AccountPaymentSettings>()

  useEffect(() => {
    setCurrentAccountPaymentSettings(accountPaymentSettings)
  }, [accountPaymentSettings])

  useEffect(() => {
    const isEnable = !isEqual(accountPaymentSettings, currentAccountPaymentSettings) && assertAccountPaymentSettings(currentAccountPaymentSettings).length === 0
    setIsSaveEnabled(isEnable)
  }, [accountPaymentSettings, currentAccountPaymentSettings])

  const currentAccountBlockchains = useMemo(() => {
    return currentAccountPaymentSettings?.blockchains
      .map(item => blockchains?.find(blockchain => blockchain.name.toLocaleLowerCase() === item.toLocaleLowerCase()))
      .filter(item => !!item) as BlockchainMeta[] | undefined
  }, [blockchains, currentAccountPaymentSettings?.blockchains])

  const openTokenModalHandler = useCallback((blockchain: BlockchainMeta) => {
    setSelectedBlockchain(blockchain)
    openTokenModal()
  }, [openTokenModal])

  const restoreDefaultsHandler = useCallback(async () => {
    try {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR)
      const defaultAccountPaymentSettings = await loadAccountDefaultPaymentSettings(ApiWrapper.instance.accountDefaultPaymentSettingsRequest())
      setCurrentAccountPaymentSettings(defaultAccountPaymentSettings)
    } catch (error) {
      addInfoMessage(
        t('components.payment_settings.errors.fail_restore_default'),
        INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR,
        'danger',
        error
      )
    }
  }, [t, addInfoMessage, loadAccountDefaultPaymentSettings, removeInfoMessage])

  const validateAccountPaymentSettings = useCallback((accountPaymentSettingsToUpdate: AccountPaymentSettings): boolean => {
    const errors = assertAccountPaymentSettings(accountPaymentSettingsToUpdate)

    if (errors.length === 0) {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR)
    } else {
      addInfoMessage(errors.join('. '), INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_ERROR, 'danger')
    }

    return errors.length === 0
  }, [addInfoMessage, removeInfoMessage])

  const saveChangesHandler = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const accountPaymentSettingsToSave: AccountPaymentSettings = {
      disableConversion: currentAccountPaymentSettings?.disableConversion ?? false,
      blockchains: currentAccountPaymentSettings?.blockchains ?? [],
      assets: currentAccountPaymentSettings?.assets ?? []
    }

    const form = event.currentTarget
    if (!form.checkValidity() || !validateAccountPaymentSettings(accountPaymentSettingsToSave)) {
      event.stopPropagation()
    } else {
      removeInfoMessage(INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_SAVING_ERROR)
      try {
        await saveAccountPaymentSettings(ApiWrapper.instance.saveAccountPaymentSettingsRequest(accountPaymentSettingsToSave))
        updateAccountPaymentSettings(accountPaymentSettingsToSave)
      } catch (error) {
        addInfoMessage(
          t('components.payment_settings.errors.fail_save'),
          INFO_MESSAGE_ACCOUNT_PAYMENT_SETTINGS_SAVING_ERROR,
          'danger',
          error
        )
      }
    }

    setValidated(true)
  }, [t, currentAccountPaymentSettings?.disableConversion, currentAccountPaymentSettings?.assets, currentAccountPaymentSettings?.blockchains, addInfoMessage, removeInfoMessage, saveAccountPaymentSettings, updateAccountPaymentSettings, validateAccountPaymentSettings])

  const updateAccountPaymentSettingsHandler = useCallback((accountPaymentSettingsToUpdate: AccountPaymentSettings) => {
    setCurrentAccountPaymentSettings(accountPaymentSettingsToUpdate)
  }, [])

  const getBlockchains = (blockchainsToShow: BlockchainMeta[], accountPaymentSettingsToShow: AccountPaymentSettings) => {
    return blockchainsToShow
      .map((blockchain, i) => {
        return <BlockchainSettings
          key={blockchain.name}
          index={i}
          blockchain={blockchain.name}
          settings={accountPaymentSettingsToShow}
          onUpdate={updateAccountPaymentSettingsHandler}
          onOpenTokenModal={() => openTokenModalHandler(blockchain)}
        />
      })
  }

  return (
    <>
      <h3 className="mb-3">{t('components.payment_settings.title')}</h3>

      <p>
        {t('components.payment_settings.desc')}
      </p>

      {(!currentAccountPaymentSettings) && (
        <div>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        </div>
      )}

      {(!!currentAccountPaymentSettings && !!currentAccountBlockchains) && (
        <Form noValidate validated={validated} onSubmit={saveChangesHandler} onBlur={(event) => event.currentTarget.checkValidity()}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label={t('components.payment_settings.disable_conversion')}
              checked={currentAccountPaymentSettings.disableConversion}
              onChange={e => setCurrentAccountPaymentSettings({
                ...currentAccountPaymentSettings,
                disableConversion: e.target.checked
              })}
              disabled={!rbacSettings?.isOwner && rbacSettings?.permissions['payment_settings'] !== 'Modify'}
            />
            <Form.Text className="text-muted">
              {t('components.payment_settings.disable_conversion_desc')}
            </Form.Text>
          </Form.Group>

          {(currentAccountBlockchains.length === 0) && (
            <Alert variant="warning">
              {t('components.payment_settings.no_blockchains_alert')}
            </Alert>
          )}

          {(currentAccountBlockchains.length > 0) && (
            <Table borderless>
              <thead>
                <tr className='border'>
                  <th scope="col">{t('components.payment_settings.priority_col')}</th>
                  <th scope="col">{t('components.payment_settings.blockchain_col')}</th>
                  <th scope="col">{t('components.payment_settings.tokens_col')}</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {getBlockchains(currentAccountBlockchains, currentAccountPaymentSettings)}
              </tbody>
            </Table>
          )}

          <RbacGuard requiredKeys={['payment_settings']} requiredPermission='Modify' element={
            <>
              <BlockchainsModal accountPaymentSettings={currentAccountPaymentSettings} onUpdateAccountPaymentSettings={updateAccountPaymentSettingsHandler} />
              <TokensModal accountPaymentSettings={currentAccountPaymentSettings} blockchain={selectedBlockchain} onUpdateAccountPaymentSettings={updateAccountPaymentSettingsHandler} />

              <Button variant="primary" type="submit" disabled={saveAccountPaymentSettingsStatus === 'processing' || !isSaveEnabled}>
                {t('common.save_changes_btn')}
              </Button>
              <Button variant="outline-secondary" onClick={openBlockchainModal} className='ms-1'>
                {t('components.payment_settings.add_blockchain_btn')}
              </Button>
              <Button variant="outline-secondary" onClick={restoreDefaultsHandler} className='ms-1' disabled={loadAccountDefaultPaymentSettingsStatus === 'processing'}>
                {t('common.restore_defaults_btn')}
              </Button>
            </>
          } />

          {(saveAccountPaymentSettingsStatus === 'processing') && (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='ms-1'>
              <span className="visually-hidden">{t('common.saving')}</span>
            </Spinner>
          )}
        </Form>
      )}
    </>
  )
}

export default PaymentSettings
