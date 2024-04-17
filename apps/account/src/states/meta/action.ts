import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { MetaResponse } from 'rango-sdk-basic'

export const fetchMeta: Readonly<{
  pending: ActionCreatorWithPayload<{ requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ meta: MetaResponse; requestId: string }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string; requestId: string }>
}> = {
  pending: createAction('meta/pending'),
  fulfilled: createAction('meta/fulfilled'),
  rejected: createAction('meta/rejected'),
}
