import { nanoid } from '@reduxjs/toolkit'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainMeta, MetaResponse, Token } from 'rango-sdk-basic'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { fetchMeta } from './action'
import { convertErrorToMessage } from '../../libs/utils'
import { AppState } from '../store'
import { ApiWrapper } from '../../libs/services/api-wrapper'
import useApiRequest from '../../libs/hooks/useApiRequest'

export function useMeta(): AppState['meta'] {
  return useAppSelector(state => state.meta)
}

export function useBlockchains(): BlockchainMeta[] | undefined {
  return useAppSelector(state => state.meta.current?.blockchains)
}

export function useTokens(): Token[] | undefined {
  return useAppSelector(state => state.meta.current?.tokens)
}

export function useFetchMetaCallback(): () => Promise<MetaResponse | undefined> {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { process: loadMeta } = useApiRequest<MetaResponse>()

  return useCallback(async () => {
    const requestId = nanoid()
    dispatch(fetchMeta.pending({ requestId }))

    try {
      const meta = await loadMeta(ApiWrapper.instance.metaRequest())
      if (meta) {
        dispatch(fetchMeta.fulfilled({ meta, requestId }))
      } else {
        dispatch(fetchMeta.rejected({ requestId, errorMessage: t('states.meta.errors.not_found')}))
      }
      return meta
    } catch (error) {
      dispatch(fetchMeta.rejected({ requestId, errorMessage: convertErrorToMessage(error) }))
      throw error
    }
  }, [t, dispatch, loadMeta])
}
