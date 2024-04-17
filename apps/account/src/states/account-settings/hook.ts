import { nanoid } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { fetchAccountSettings } from './action'
import { convertErrorToMessage } from '../../libs/utils'
import { AccountApiSettings, AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountRbacSettings, AccountSettings, AccountTeamSettings } from '../../types/account-settings'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'

export function useAccountRbacSettings(): AccountRbacSettings | undefined {
  return useAppSelector(state => state.accountSettings.current?.rbacSettings)
}

export function useAccountApiSettings(): AccountApiSettings | undefined {
  return useAppSelector(state => state.accountSettings.current?.apiSettings)
}

export function useAccountCommonSettings(): AccountCommonSettings | undefined {
  return useAppSelector(state => state.accountSettings.current?.commonSettings)
}

export function useAccountNotificationSettings(): AccountNotificationSettings | undefined {
  return useAppSelector(state => state.accountSettings.current?.notificationSettings)
}

export function useAccountPaymentSettings(): AccountPaymentSettings | undefined {
  return useAppSelector(state => state.accountSettings.current?.paymentSettings)
}

export function useAccountTeamSettings(): AccountTeamSettings | undefined {
  return useAppSelector(state => state.accountSettings.current?.teamSettings)
}

export function useFetchAccountSettingsCallback(): () => Promise<AccountSettings | undefined> {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { process: loadAccountSettings } = useApiRequest<AccountSettings>()

  return useCallback(async () => {
    const requestId = nanoid()
    dispatch(fetchAccountSettings.pending({ requestId }))

    try {
      const accountSettings = await loadAccountSettings(ApiWrapper.instance.accountSettingsRequest())
      if (accountSettings) {
        dispatch(fetchAccountSettings.fulfilled({ accountSettings, requestId }))
      } else {
        dispatch(fetchAccountSettings.rejected({ requestId, errorMessage: t('states.account_settings.errors.not_found')}))
      }
      return accountSettings
    } catch (error) {
      dispatch(fetchAccountSettings.rejected({ requestId, errorMessage: convertErrorToMessage(error) }))
      throw error
    }
  }, [t, dispatch, loadAccountSettings])
}

export function useUpdateAccountPaymentSettingsCallback(): (accountPaymentSettings: AccountPaymentSettings | undefined) => void {
  const dispatch = useAppDispatch()

  return useCallback((accountPaymentSettings: AccountPaymentSettings | undefined) => {
    dispatch(fetchAccountSettings.updatedPaymentSetting({ accountPaymentSettings }))
  }, [dispatch])
}

export function useUpdateAccountCommonSettingsCallback(): (accountCommonSettings: AccountCommonSettings | undefined) => void {
  const dispatch = useAppDispatch()

  return useCallback((accountCommonSettings: AccountCommonSettings | undefined) => {
    dispatch(fetchAccountSettings.updatedCommonSetting({ accountCommonSettings }))
  }, [dispatch])
}

export function useUpdateAccountNotificationSettingsCallback(): (accountNotificationSettings: AccountNotificationSettings | undefined) => void {
  const dispatch = useAppDispatch()

  return useCallback((accountNotificationSettings: AccountNotificationSettings | undefined) => {
    dispatch(fetchAccountSettings.updatedNotificationSetting({ accountNotificationSettings }))
  }, [dispatch])
}

export function useUpdateAccountApiSettingsCallback(): (accountApiSettings: AccountApiSettings | undefined) => void {
  const dispatch = useAppDispatch()

  return useCallback((accountApiSettings: AccountApiSettings | undefined) => {
    dispatch(fetchAccountSettings.updatedApiSettings({ accountApiSettings }))
  }, [dispatch])
}

export function useUpdateAccountTeamSettingsCallback(): (accountTeamSettings: AccountTeamSettings | undefined) => void {
  const dispatch = useAppDispatch()

  return useCallback((accountTeamSettings: AccountTeamSettings | undefined) => {
    dispatch(fetchAccountSettings.updatedTeamSettings({ accountTeamSettings }))
  }, [dispatch])
}

export function useUpdateAccountRbacSettingsCallback(): (accountRbacSettings: AccountRbacSettings | undefined) => void {
  const dispatch = useAppDispatch()

  return useCallback((accountRbacSettings: AccountRbacSettings | undefined) => {
    dispatch(fetchAccountSettings.updatedRbacSettings({ accountRbacSettings }))
  }, [dispatch])
}
