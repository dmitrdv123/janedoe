import { createReducer } from '@reduxjs/toolkit'

import { fetchExchangeRate } from './action'
import { ExchangeRateResponse } from '../../types/exchange-rate-response'

interface ExchangeRateState {
  readonly current: ExchangeRateResponse | null
  readonly loadingRequestId: string | null
  readonly error: string | null
}

const initialState: ExchangeRateState = {
  error: null,
  current: null,
  loadingRequestId: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchExchangeRate.pending, (state, { payload: { requestId } }) => {
      const current = state.current ?? null

      return {
        current,
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchExchangeRate.fulfilled, (state, { payload: { requestId, exchangeRate } }) => {
      const current = state.current
      const loadingRequestId = state.loadingRequestId

      // no-op if update does nothing
      if (current) {
        if (loadingRequestId === null || loadingRequestId === requestId) {
          return {
            current: exchangeRate,
            loadingRequestId: null,
            error: null
          }
        }
      } else {
        return {
          current: exchangeRate,
          loadingRequestId: null,
          error: null
        }
      }
    })
    .addCase(fetchExchangeRate.rejected, (state, { payload: { requestId, errorMessage } }) => {
      if (state.loadingRequestId !== requestId) {
        return
      }

      return {
        current: state.current ? state.current : null,
        loadingRequestId: null,
        error: errorMessage,
      }
    })
)
