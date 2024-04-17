import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { AppSettings } from '../../types/app-settings'

export const fetchSettings: Readonly<{
  pending: ActionCreatorWithPayload<{ requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ settings: AppSettings; requestId: string }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string; requestId: string }>
}> = {
  pending: createAction('settings/pending'),
  fulfilled: createAction('settings/fulfilled'),
  rejected: createAction('settings/rejected'),
}
