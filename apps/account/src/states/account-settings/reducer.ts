import { createReducer } from '@reduxjs/toolkit'

import { AccountSettings } from '../../types/account-settings'
import { fetchAccountSettings } from './action'

interface AccountSettingsState {
  readonly current: AccountSettings | null
  readonly loadingRequestId: string | null
  readonly error: string | null
}

const initialState: AccountSettingsState = {
  error: null,
  current: null,
  loadingRequestId: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchAccountSettings.pending, (state, { payload: { requestId } }) => {
      const current = state.current ?? null

      return {
        current,
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchAccountSettings.fulfilled, (state, { payload: { requestId, accountSettings } }) => {
      const current = state.current
      const loadingRequestId = state.loadingRequestId

      // no-op if update does nothing
      if (current) {
        if (loadingRequestId === null || loadingRequestId === requestId) {
          return {
            current: accountSettings,
            loadingRequestId: null,
            error: null
          }
        }
      } else {
        return {
          current: accountSettings,
          loadingRequestId: null,
          error: null
        }
      }
    })
    .addCase(fetchAccountSettings.rejected, (state, { payload: { requestId, errorMessage } }) => {
      if (state.loadingRequestId !== requestId) {
        return
      }

      return {
        current: state.current ? state.current : null,
        loadingRequestId: null,
        error: errorMessage,
      }
    })
    .addCase(fetchAccountSettings.updatedPaymentSetting, (state, { payload: { accountPaymentSettings } }) => {
      return {
        current: {
          rbacSettings: state.current?.rbacSettings,
          paymentSettings: accountPaymentSettings,
          commonSettings: state.current?.commonSettings,
          notificationSettings: state.current?.notificationSettings,
          apiSettings: state.current?.apiSettings,
          teamSettings: state.current?.teamSettings
        },
        loadingRequestId: null,
        error: null
      }
    })
    .addCase(fetchAccountSettings.updatedApiSettings, (state, { payload: { accountApiSettings } }) => {
      return {
        current: {
          rbacSettings: state.current?.rbacSettings,
          paymentSettings: state.current?.paymentSettings,
          commonSettings: state.current?.commonSettings,
          notificationSettings: state.current?.notificationSettings,
          apiSettings: accountApiSettings,
          teamSettings: state.current?.teamSettings
        },
        loadingRequestId: null,
        error: null
      }
    })
    .addCase(fetchAccountSettings.updatedCommonSetting, (state, { payload: { accountCommonSettings } }) => {
      return {
        current: {
          rbacSettings: state.current?.rbacSettings,
          paymentSettings: state.current?.paymentSettings,
          commonSettings: accountCommonSettings,
          notificationSettings: state.current?.notificationSettings,
          apiSettings: state.current?.apiSettings,
          teamSettings: state.current?.teamSettings
        },
        loadingRequestId: null,
        error: null
      }
    })
    .addCase(fetchAccountSettings.updatedNotificationSetting, (state, { payload: { accountNotificationSettings } }) => {
      return {
        current: {
          rbacSettings: state.current?.rbacSettings,
          paymentSettings: state.current?.paymentSettings,
          commonSettings: state.current?.commonSettings,
          notificationSettings: accountNotificationSettings,
          apiSettings: state.current?.apiSettings,
          teamSettings: state.current?.teamSettings
        },
        loadingRequestId: null,
        error: null
      }
    })
    .addCase(fetchAccountSettings.updatedTeamSettings, (state, { payload: { accountTeamSettings } }) => {
      return {
        current: {
          rbacSettings: state.current?.rbacSettings,
          paymentSettings: state.current?.paymentSettings,
          commonSettings: state.current?.commonSettings,
          notificationSettings: state.current?.notificationSettings,
          apiSettings: state.current?.apiSettings,
          teamSettings: accountTeamSettings
        },
        loadingRequestId: null,
        error: null
      }
    })
    .addCase(fetchAccountSettings.updatedRbacSettings, (state, { payload: { accountRbacSettings } }) => {
      return {
        current: {
          rbacSettings: accountRbacSettings,
          paymentSettings: state.current?.paymentSettings,
          commonSettings: state.current?.commonSettings,
          notificationSettings: state.current?.notificationSettings,
          apiSettings: state.current?.apiSettings,
          teamSettings: state.current?.teamSettings
        },
        loadingRequestId: null,
        error: null
      }
    })
)
