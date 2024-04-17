import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFetchMetaCallback, useMeta } from './hook'
import { useInfoMessages } from '../application/hook'
import { INFO_MESSAGE_META_ERROR } from '../../constants'

export default function MetaLoader() {
  const { t } = useTranslation()
  const { addInfoMessage, removeInfoMessage } = useInfoMessages()

  const meta = useMeta()
  const fetchMeta = useFetchMetaCallback()

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
