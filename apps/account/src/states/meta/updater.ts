import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useInterval } from '../../libs/hooks/useInterval'
import { useFetchMetaCallback, useMeta } from './hook'
import { useIsWindowVisible } from '../../libs/hooks/useIsWindowVisible'
import { useInfoMessages } from '../application/hook'
import { INFO_MESSAGE_META_ERROR } from '../../constants'

export default function MetaUpdater() {
  const { t } = useTranslation()
  const isWindowVisible = useIsWindowVisible()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const meta = useMeta()
  const fetchMeta = useFetchMetaCallback()
  const fetchMetaCallback = useCallback(async () => {
    if (!isWindowVisible) {
      return
    }

    removeInfoMessage(INFO_MESSAGE_META_ERROR)
    try {
      await fetchMeta()
    } catch (error) {
      addInfoMessage(t('states.meta.errors.load_error'), INFO_MESSAGE_META_ERROR, 'danger')
    }
  }, [t, isWindowVisible, fetchMeta, addInfoMessage, removeInfoMessage])

  // fetch all lists every 10 minutes
  useInterval(fetchMetaCallback, 1000 * 60 * 10)

  // whenever a meta is not loaded and not loading, try again to load it
  useEffect(() => {
    const load = async () => {
      if (meta.current || meta.loadingRequestId || meta.error) {
        return
      }

      removeInfoMessage(INFO_MESSAGE_META_ERROR)
      try {
        await fetchMeta()
      } catch (error) {
        addInfoMessage(t('states.meta.errors.load_error'), INFO_MESSAGE_META_ERROR, 'danger')
      }
    }

    load()
  }, [t, meta, fetchMeta, addInfoMessage, removeInfoMessage])

  return null
}
