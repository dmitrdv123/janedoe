import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { ExchangeRateResponse } from '../../types/exchange-rate-response';

export const fetchExchangeRate: Readonly<{
  pending: ActionCreatorWithPayload<{ requestId: string }>
  fulfilled: ActionCreatorWithPayload<{ exchangeRate: ExchangeRateResponse; requestId: string }>
  rejected: ActionCreatorWithPayload<{ errorMessage: string; requestId: string }>
}> = {
  pending: createAction('exchange/pending'),
  fulfilled: createAction('exchange/fulfilled'),
  rejected: createAction('exchange/rejected'),
}
