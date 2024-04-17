import { createReducer } from '@reduxjs/toolkit'
import { Token } from 'rango-sdk-basic'

import { fetchSettings } from './action'
import { Settings } from '../../types/settings'

interface SettingsState {
  readonly current: Settings | null
  readonly loadingRequestId: string | null
  readonly error: string | null
  readonly dt: number | null
}

const initialState: SettingsState = {
  error: null,
  current: null,
  loadingRequestId: null,
  dt: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchSettings.pending, (state, { payload: { requestId } }) => {
      return {
        current: state.current,
        dt: state.dt,
        loadingRequestId: requestId,
        error: null,
      }
    })
    .addCase(fetchSettings.fulfilled, (state, { payload: { requestId, settings } }) => {
      const current = state.current
      const loadingRequestId = state.loadingRequestId

      const tokens = settings.meta.tokens
        .filter(token => !(token as any).is && (token as any).p)
        .map(token => {
          const res: Token = {
            blockchain: (token as any).b as string,
            chainId: null,
            address: (token as any).a ? (token as any).a as string : null,
            symbol: (token as any).s as string,
            name: (token as any).n as string,
            decimals: (token as any).d as number,
            image: (token as any).i as string,
            usdPrice: (token as any).p as number,
            blockchainImage: '',
            isPopular: (token as any).ip ? (token as any).ip as boolean : false
          }

          return res
        })

      // no-op if update does nothing
      if (current) {
        if (loadingRequestId === null || loadingRequestId === requestId) {
          return {
            current: {
              appSettings: settings.appSettings,
              paymentSettings: settings.paymentSettings,
              meta: {
                blockchains: settings.meta.blockchains,
                tokens: tokens,
                swappers: settings.meta.swappers
              },
              exchangeRate: settings.exchangeRate
            },
            dt: Date.now(),
            loadingRequestId: null,
            error: null
          }
        }
      } else {
        return {
          current: {
            appSettings: settings.appSettings,
            paymentSettings: settings.paymentSettings,
            meta: {
              blockchains: settings.meta.blockchains,
              tokens: tokens,
              swappers: settings.meta.swappers
            },
            exchangeRate: settings.exchangeRate
          },
          dt: Date.now(),
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
        current: state.current,
        dt: state.dt,
        loadingRequestId: null,
        error: errorMessage,
      }
    })
)
