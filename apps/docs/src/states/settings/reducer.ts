import { createReducer } from '@reduxjs/toolkit'

import { fetchSettings } from './action'
import { AppSettings } from '../../types/app-settings'

interface SettingsState {
  readonly current: AppSettings | null
  readonly loadingRequestId: string | null
  readonly error: string | null
}

const initialState: SettingsState = {
  error: null,
  current: null,
  loadingRequestId: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchSettings.pending, (state, { payload: { requestId } }) => {
      const current = state.current ?? null

      return {
        current,
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchSettings.fulfilled, (state, { payload: { requestId, settings } }) => {
      const current = state.current
      const loadingRequestId = state.loadingRequestId

      // no-op if update does nothing
      if (current) {
        if (loadingRequestId === null || loadingRequestId === requestId) {
          return {
            current: settings,
            loadingRequestId: null,
            error: null
          }
        }
      } else {
        return {
          current: settings,
          loadingRequestId: null,
          error: null
        }
      }
    })
    .addCase(fetchSettings.rejected, (state, { payload: { requestId, errorMessage } }) => {
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
