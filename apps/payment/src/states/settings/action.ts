import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { Settings } from '../../types/settings'

export const fetchSettings: Readonly<{
  pending: ActionCreatorWithPayload<{ requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ settings: Settings; requestId: string }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string; requestId: string }>
}> = {
  pending: createAction('settings/pending'),
  fulfilled: createAction('settings/fulfilled'),
  rejected: createAction('settings/rejected'),
}
