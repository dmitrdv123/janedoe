import { createReducer } from '@reduxjs/toolkit'
import { MetaResponse } from 'rango-sdk-basic'

import { fetchMeta } from './action'

interface MetaState {
  readonly current: MetaResponse | null
  readonly loadingRequestId: string | null
  readonly error: string | null
}

const initialState: MetaState = {
  error: null,
  current: null,
  loadingRequestId: null
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchMeta.pending, (state, { payload: { requestId } }) => {
      const current = state.current ?? null

      return {
        current,
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchMeta.fulfilled, (state, { payload: { requestId, meta } }) => {
      const current = state.current
      const loadingRequestId = state.loadingRequestId

      const tokens = meta.tokens
        .filter(token => !(token as any).is && (token as any).p)
        .map(token => {
          return {
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
        })

      // no-op if update does nothing
      if (current) {
        if (loadingRequestId === null || loadingRequestId === requestId) {
          return {
            current: {
              blockchains: meta.blockchains,
              tokens: tokens,
              swappers: meta.swappers
            },
            loadingRequestId: null,
            error: null
          }
        }
      } else {
        return {
          current: {
            blockchains: meta.blockchains,
            tokens: tokens,
            swappers: meta.swappers
          },
          loadingRequestId: null,
          error: null
        }
      }
    })
    .addCase(fetchMeta.rejected, (state, { payload: { requestId, errorMessage } }) => {
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
