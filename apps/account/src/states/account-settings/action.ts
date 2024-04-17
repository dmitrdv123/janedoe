import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { AccountApiSettings, AccountCommonSettings, AccountNotificationSettings, AccountPaymentSettings, AccountRbacSettings, AccountSettings, AccountTeamSettings } from '../../types/account-settings'

export const fetchAccountSettings: Readonly<{
  pending: ActionCreatorWithPayload<{ requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ accountSettings: AccountSettings; requestId: string }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string; requestId: string }>
  updatedPaymentSetting: ActionCreatorWithPayload<{ accountPaymentSettings: AccountPaymentSettings | undefined }>
  updatedNotificationSetting: ActionCreatorWithPayload<{ accountNotificationSettings: AccountNotificationSettings | undefined }>
  updatedCommonSetting: ActionCreatorWithPayload<{ accountCommonSettings: AccountCommonSettings | undefined }>
  updatedApiSettings: ActionCreatorWithPayload<{ accountApiSettings: AccountApiSettings | undefined }>
  updatedTeamSettings: ActionCreatorWithPayload<{ accountTeamSettings: AccountTeamSettings | undefined }>
  updatedRbacSettings: ActionCreatorWithPayload<{ accountRbacSettings: AccountRbacSettings | undefined }>
}> = {
  pending: createAction('accountSettings/pending'),
  fulfilled: createAction('accountSettings/fulfilled'),
  rejected: createAction('accountSettings/rejected'),
  updatedPaymentSetting: createAction('accountSettings/updatedPaymentSetting'),
  updatedNotificationSetting: createAction('accountSettings/updatedNotificationSetting'),
  updatedCommonSetting: createAction('accountSettings/updatedCommonSetting'),
  updatedApiSettings: createAction('accountSettings/updatedApiSettings'),
  updatedTeamSettings: createAction('accountSettings/updatedTeamSettings'),
  updatedRbacSettings: createAction('accountSettings/updatedRbacSettings')
}
