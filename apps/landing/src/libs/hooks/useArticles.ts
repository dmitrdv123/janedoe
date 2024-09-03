import { useState, useEffect, useRef, useCallback } from 'react'
import isEqual from 'lodash.isequal'

import useApiRequest from './useApiRequest'
import { ApiWrapper } from '../services/api-wrapper'
import { ApiRequestStatus } from '../../types/api-request'
import { Article } from '../../types/article'

export default function useArticles() {
  const [data, setData] = useState<Article[] | undefined>(undefined)
  const [status, setStatus] = useState<ApiRequestStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)

  const initRef = useRef(false)
  const lastRef = useRef<Article | undefined>(undefined)

  const { process: loadArticles } = useApiRequest<Article[]>()

  const load = useCallback(async () => {
    setStatus('processing')
    setError(undefined)

    try {
      const newArticles = await loadArticles(
        ApiWrapper.instance.articles(
          lastRef.current?.timestamp
        )
      )

      setData(prevArticles => [...(prevArticles ?? []), ...(newArticles ?? [])])
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setError(error as Error)
    }
  }, [loadArticles])

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      lastRef.current = undefined

      setData(undefined)

      load()
    }
  }, [load])

  const loadNext = useCallback(async () => {
    const last: Article | undefined = data && data.length > 0
      ? data[data.length - 1]
      : undefined

    if (isEqual(lastRef.current, last)) {
      return
    }

    lastRef.current = last

    await load()
  }, [data, load])

  return { data, status, error, loadNext }
}
