import { useEffect } from 'react'
import { NavDropdown, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import useLocalStorageState from 'use-local-storage-state'

import { AuthData } from '../../../../types/auth-data'
import { convertErrorToMessage } from '../../../../libs/utils'
import { useLocation, useParams } from 'react-router-dom'
import useApiRequestImmediate from '../../../../libs/hooks/useApiRequestImmediate'
import { SharedAccountProfileResponse } from '../../../../types/account-profile'
import { ApiWrapper } from '../../../../libs/services/api-wrapper'
import { useInfoMessages } from '../../../../states/application/hook'
import { AUTH_DATA_KEY, INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR } from '../../../../constants'

const AccountsDropdown: React.FC = () => {
  const { t } = useTranslation()
  const [authData] = useLocalStorageState<AuthData>(AUTH_DATA_KEY)
  const { hash } = useLocation()
  const { id } = useParams()

  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const {
    status: sharedAccountsStatus,
    data: sharedAccounts,
    error: sharedAccountsError
  } = useApiRequestImmediate<SharedAccountProfileResponse>(
    ApiWrapper.instance.sharedAccountsRequest()
  )

  useEffect(() => {
    if (sharedAccountsError) {
      addInfoMessage(convertErrorToMessage(sharedAccountsError, t('common.errors.default')), `${INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR}`, 'danger')
    } else {
      removeInfoMessage(`${INFO_MESSAGE_SHARED_ACCOUNT_LOAD_ERROR}`)
    }
  }, [sharedAccountsError, t, addInfoMessage, removeInfoMessage])

  return (
    <NavDropdown
      title={t('components.navbar.account', { account: id ?? authData?.id ?? '' })}
      align='end'
    >
      <NavDropdown.Item href={`/app/${hash}`} active={!id || id.toLocaleLowerCase() === authData?.id.toLocaleLowerCase()}>
        {authData?.id}
      </NavDropdown.Item>

      <NavDropdown.Header>
        {t('components.navbar.shared_accounts')}
      </NavDropdown.Header>

      {(sharedAccountsStatus === 'processing') && (
        <NavDropdown.ItemText>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        </NavDropdown.ItemText>
      )}

      {(sharedAccountsStatus !== 'processing' && sharedAccounts && sharedAccounts.accounts.length === 0) && (
        <NavDropdown.ItemText>
          {t('components.navbar.no_accounts')}
        </NavDropdown.ItemText>
      )}

      {(sharedAccountsStatus !== 'processing' && sharedAccounts && sharedAccounts.accounts.length > 0) && (
        sharedAccounts.accounts.map(account => (
          <NavDropdown.Item key={account.sharedAccountId} href={`/app/${account.sharedAccountId}/${hash}`} active={id?.toLocaleLowerCase() === account.sharedAccountId.toLocaleLowerCase()}>
            {account.sharedAccountId}
          </NavDropdown.Item>
        ))
      )}
    </NavDropdown>
  )
}

export default AccountsDropdown
